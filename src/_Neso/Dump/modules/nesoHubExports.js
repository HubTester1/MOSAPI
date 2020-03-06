
// ----- PULL IN MODULES

const nesoDBQueries = require('./nesoDBQueries');
const nesoSPSync = require('./nesoSPSync');
const nesoUtilities = require('./nesoUtilities');
const jsonexport = require('jsonexport');
const fse = require('fs-extra');
const moment = require('moment');


// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	ReturnExportSettingsData: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('exportSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnExportWhitelistedDomains: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnExportSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnGSEStats: (startDate, endDate) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the nesoHealth document collection
			module.exports.ProcessGSEExport(startDate, endDate)
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	ProcessGSEExport: (startDate, endDate) =>
		// return a new promise
		new Promise((resolve, reject) => {
			const formattedStartDate = `${moment(startDate).format('YYYY/MM/DDTHH:mm:ss')}Z`;
			const formattedEndDate = `${moment(endDate).format('YYYY/MM/DDTHH:mm:ss')}Z`;
			const storagePath = `${process.env.appRoot}\\public\\exports\\hr\\gse\\gseStats.csv`;
			// get a promise to sync all GSE data from SPO to Neso
			module.exports.SyncGSEItemsForExport(formattedStartDate, formattedEndDate)
				// if the promise is resolved with a result
				.then((syncResult) => {
					// get a promise to pull all synced GSE signups from db
					nesoDBQueries.ReturnAllDocsFromCollection('gseCreditGrantedInDateRangeSignups')
						// if the promise is resolved with the docs
						.then((signupQueryResult) => {
							// get a group of promises to get a processed version of each signup
							// 		with schedule data added
							Promise.all(signupQueryResult.docs
								.map(signup => module.exports.ReturnProcessedSignup(signup)))
								// if the promises were all resolved with a result set
								.then((signupProcessingResults) => {
									// get a group of promises to get job info added to each result
									Promise.all(signupProcessingResults.map(schedule => 
										module.exports.ReturnProcessedSchedule(schedule)))
										// if the promises were all resolved with a result set
										.then((scheduleProcessingResults) => {
											// set up var to contain final version of result set
											const finalResults = [];
											// iterate over returned results and push the 
											// 		non-blank ones to the final results set
											scheduleProcessingResults.forEach((result) => {
												if (result.name) {
													finalResults.push(result);
												}
											});
											// convert finalResults to CSV
											jsonexport(finalResults, (error, csv) => {
												if (error) return error;
												// write CSV to file
												fse.writeFile(storagePath, csv, 'utf8', (err) => {
													// log success or error message
													// if (err) {
													// 	console.log(`Some error occured - 
													// 	file either not saved or corrupted file saved.`);
													// } else {
													// 	console.log('It\'s saved!');
													// }
												});
												// resolve top-level promise
												resolve(csv);
											});
										})
										// if the promise is rejected with an error
										.catch((scheduleProcessingError) => {
											console.log('scheduleProcessingError');
											console.log(scheduleProcessingError);
											// reject this promise with the error
											reject(scheduleProcessingError);
										});
								})
								// if the promise is rejected with an error
								.catch((signupProcessingError) => {
									console.log('signupProcessingError');
									console.log(signupProcessingError);
									// reject this promise with the error
									reject(signupProcessingError);
								});
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((signupQueryError) => {
							reject(signupQueryError);
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((syncError) => { reject(syncError); });
		}),

	ReturnProcessedSignup: signup =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up a reconstructed version of the signup and extract the signup account info
			const reconstructedSignup = {
				name: signup.AllRequestData['Requested-For'][0].displayText,
			};
			const signupAccount = 
				nesoUtilities
					.ReplaceAll('@mos.org', '', nesoUtilities.ReplaceAll('i:0#.f\\|membership\\|', '', signup.AllRequestData['Requested-For'][0].account));
			// get a promise to get schedules from db
			nesoDBQueries.ReturnOneSpecifiedDocFromCollection('gseCompletedInDateRangeSchedules', {
				ID: parseInt(signup.ScheduleID, 10),
			}, {})
				// if the promise is resolved with the docs
				.then((scheduleQueryResult) => {
					// add schedule info to the reconstructed signup
					reconstructedSignup.date = scheduleQueryResult.docs.Date;
					reconstructedSignup.length = scheduleQueryResult.docs.ShiftLength;
					reconstructedSignup.jobID = scheduleQueryResult.docs.JobID;
					// get a promise to get user info from the db
					nesoDBQueries.ReturnOneSpecifiedDocFromCollection('adUsers', {
						account: signupAccount,
					}, {})
						// if the promise is resolved with the docs
						.then((userQueryResult) => {
							// if the user's employee ID could be found
							if (userQueryResult.docs && userQueryResult.docs.employeeID) {
								// add it to the reconstructed signup
								reconstructedSignup.employeeID = userQueryResult.docs.employeeID;
							}
							// resolve this promise with the reconstructed signup
							resolve(reconstructedSignup);
						})
						// if the promise is rejected with an error, 
						// 		then reject this promise with an error
						.catch((userQueryError) => {
							reject(userQueryError);
						});
				})
				// if the promise is rejected with an error, 
				// 		then reject this promise with an error
				.catch((scheduleQueryError) => {
					reject(scheduleQueryError);
				});
		}),

	ReturnProcessedSchedule: schedule =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up a reconstructed schedule
			const reconstructedSchedule = {
				name: schedule.name,
				date: schedule.date,
				length: schedule.length,
				employeeID: schedule.employeeID,
			};
			// get a promise to get job info for this schedule from the db
			nesoDBQueries.ReturnOneSpecifiedDocFromCollection('gseApprovedJobs', {
				ID: parseInt(schedule.jobID, 10),
			}, {})
				// if the promise is resolved with the docs
				.then((jobQueryResult) => {
					// if the job title could be found
					if (jobQueryResult.docs && jobQueryResult.docs.JobTitle) {
						// add it to the reconstructed schedule
						reconstructedSchedule.title = jobQueryResult.docs.JobTitle;
					}
					// resolve this promise with the reconstructed schedule
					resolve(reconstructedSchedule);
				})
				// if the promise is rejected with an error, 
				// 		then reject this promise with an error
				.catch((jobQueryError) => {
					reject(jobQueryError);
				});
		}),

	SyncGSEItemsForExport: (startDate, endDate) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// create promises to sync all GSE data from SPO to Neso
			Promise.all([
				nesoSPSync.SyncGSECompletedInDateRangeSchedulesListItems(startDate, endDate),
				nesoSPSync.SyncGSECreditGrantedInDateRangeSignupsListItems(startDate, endDate),
			])
				// when all promises have resolved
				.then((syncResults) => {
					// resolve with non-error flag
					resolve({
						error: false,
					});
				})
				// if a promise was rejected with an error
				.catch((syncErrors) => {
					// reject with error flag
					reject({
						error: false,
						syncErrors,
					});
				});
		}),
};
