
// ----- PULL IN MODULES

const moment = require('moment-timezone');
const nesoDBQueries = require('./nesoDBQueries');
const nesoEmail = require('./nesoEmail');

// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	SendEmails: (emailsToSend) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// for each email
			emailsToSend.forEach((emailData) => {
				// create standardized hub email
				const standardizedHubEmail = 
					module.exports.CreateStandardHubEmail(emailData);
				// send the email
				nesoEmail.SendEmail(standardizedHubEmail);
			});
			// when completed, resolve this promise; note: 
			// 		SendEmail function will handle errors
			resolve('delegated');
		}),

	CreateStandardHubEmail: (emailData) => ({
		to: emailData.to,
		from: 'The Hub <noreply@mos.org>',
		subject: emailData.subject,
		html: `<div style="font-family: 'wf_segoe-ui_normal', 'Segoe UI', 'Segoe WP', Arial, sans-serif; color: #212121; font-size: 15px">${emailData.bodyUnique}<p style="font-weight: 700">The Hub</p></div>`,
		system: 'hub',
		type: emailData.emailType,
		event: emailData.caller,
	}),

	ReturnGSESignupReminderNotificationsForOneSchedule: (schedule) => 
		// note: this function will always resolve the promise; rejecting for one signup would derail
		// 		handling all signups; calling function must expect resolution and discern between
		// 		notification data and error data in the return
		// return a new promise
		new Promise((resolve, reject) => {
			// set up var
			const notificationsToReturn = [];
			// get a promise to retrieve all submitted schedules
			nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('gseApprovedJobs', {
				ID: parseInt(schedule.JobID, 10),
			}, {})
			// if the promise is resolved with the docs
				.then((jobQueryResult) => {
					const job = jobQueryResult.docs[0];
					const jobAdmin = job.AllRequestData['Requested-For'][0];
					// get a promise to retrieve all submitted schedules
					nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('gseSignedUpSignups', {
						ScheduleID: schedule.ID.toString(),
					}, {})
						// if the promise is resolved with the docs
						.then((signupsResult) => {
							const signupsArray = signupsResult.docs;
							if (signupsArray.length) {
								signupsArray.forEach((signup, signupIndex) => {
									// extract data as vars
									const signupPerson = signup.AllRequestData['Requested-For'][0];
									const signupLink =
													`<a href="https://bmos.sharepoint.com/sites/hr-service-signups/SitePages/App.aspx?r=${signup.ID}">review the details</a>`;
									const jobAdminLink = 
													`<a href="mailto:${jobAdmin.description}">${jobAdmin.displayText}</a>`;
									const scheduleStartDatetimeRaw = 
													schedule.Date.slice(0, 10) +
													schedule.StartTime.slice(10, 20);
									const scheduleStartDatetime = 
													moment(scheduleStartDatetimeRaw).isDST() ?
														moment(scheduleStartDatetimeRaw).subtract(1, 'hour') :
														moment(scheduleStartDatetimeRaw);
									const scheduleStartDateString = moment(scheduleStartDatetime).format('MMMM D');
									const scheduleStartTimeString = moment(scheduleStartDatetime).format('h:mm a');
									// push a notification object
									notificationsToReturn.push({
										emailType: 'Notification',
										caller: 'signupReminder requestedFor',
										to: signupPerson.description,
										subject: `GSE Signup #${signup.ID}: reminder`,
										bodyUnique: `Please report to ${job.Location} on ${scheduleStartDateString} at ${scheduleStartTimeString} for "${job.JobTitle}". Feel free to ${signupLink} or contact ${jobAdminLink} with any questions.`,
									});
									// if this is the last signup in signupsArray
									if ((signupIndex + 1) === signupsArray.length) {
										// resolve this promise with all notifications
										resolve(notificationsToReturn);
									}
								});
							} else {
								resolve(notificationsToReturn);
							}
						})
						// if the promise is rejected with an error, then 
						// 		resolve this promise with an error
						.catch((error) => { resolve(error); });
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { resolve(error); });
		}),

	ProcessGSESignupReminderNotifications: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			if (process.env.use === 'prod') {
				// set up vars
				const tomorrowTruncated = moment().add(1, 'day').format('YYYY-MM-DD');
				const oneWeekOutTruncated = moment().add(1, 'week').format('YYYY-MM-DD');
				const notificationsToSend = [];
				// get a promise to retrieve all submitted schedules
				nesoDBQueries.ReturnAllDocsFromCollection('gseSchedules')
					// if the promise is resolved with the docs
					.then((scheduleQueryResult) => {
						// set up container for notification retrieval promises
						const returnNoticationPromises = [];
						// for each submitted schedule
						scheduleQueryResult.docs.forEach((submittedGSESchedule) => {
							// clone param
							const scheduleClone = submittedGSESchedule;
							// if this schedule is for tomorrow or a week from now
							const scheduleStartDateTruncated =
								scheduleClone.Date.slice(0, 10);
							if (
								scheduleStartDateTruncated === tomorrowTruncated || 
								scheduleStartDateTruncated === oneWeekOutTruncated
							) {
								// push promise to return signup notifications for it
								returnNoticationPromises
									.push(module.exports.ReturnGSESignupReminderNotificationsForOneSchedule(scheduleClone));
							}
						});
						// when all notification retrieval promises are resolved
						Promise.all(returnNoticationPromises)
							.then((notificationRetrievalResults) => {
								// extract the emails from the results
								// for each notification
								notificationRetrievalResults.forEach((notificationRetrievalResult) => {
									notificationRetrievalResult.forEach((notificationOrError) => {
										// if this is an email and not an error
										if (notificationOrError.emailType) {
											// push to notifications to send
											notificationsToSend.push(notificationOrError);
										}
									});
								});
								// send the emails
								module.exports.SendEmails(notificationsToSend)
									// if the promise is resolved with a result, then 
									// 		resolve this promise with the result
									.then((result) => { resolve(result); })
									// if the promise is rejected with an error, then 
									// 		reject this promise with an error
									.catch((error) => { reject(error); });
							});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((error) => {
						reject(error);
					});
			} else {
				resolve('environment is not prod');
			}
		}),

	ReturnGSEScheduleCreditReminderNotificationsForOneSchedule: (schedule) =>
		// note: this function will always resolve the promise; rejecting for one signup would derail
		// 		handling all signups; calling function must expect resolution and discern between
		// 		notification data and error data in the return
		// return a new promise
		new Promise((resolve, reject) => {
			// set up var
			const notificationsToReturn = [];
			// get promises to retrieve job and signups for this schedule
			Promise.all([
				nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('gseApprovedJobs', {
					ID: parseInt(schedule.JobID, 10),
				}, {}),
				nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('gseSignedUpSignups', {
					ScheduleID: schedule.ID.toString(),
				}, {}),
			])
				// when all promises have resolved
				.then((jobAndSignupsResults) => {
					// extract job and signup data
					const job = jobAndSignupsResults[0].docs[0];
					const signups = jobAndSignupsResults[1].docs;
					// if there was at least one signup
					if (signups[0]) {
						// prep and push credit reminder notification
						const jobAdmin = job.AllRequestData['Requested-For'][0];
						const scheduleLink =
							`<a href="https://bmos.sharepoint.com/sites/hr-service-schedules/SitePages/App.aspx?r=${schedule.ID}">grant or deny credit</a>`;
						const endDateString =
							moment(schedule.scheduleEndDatetime)
								.format('MMMM D');
						const endTimeString =
							moment(schedule.scheduleEndDatetime)
								.format('h:mm a');
						notificationsToReturn.push({
							emailType: 'Notification',
							caller: 'creditReminder jobAdmin',
							to: jobAdmin.description.toLowerCase(),
							subject: `GSE Schedule #${schedule.ID}: credit reminder`,
							bodyUnique: `This schedule for "${job.JobTitle}" ended on ${endDateString} at ${endTimeString}. Please ${scheduleLink} to those who signed up.`,
						});
					}
					// resolve this promise with the notifications array
					resolve(notificationsToReturn);
				})
				// if the promise to to retrieve job and signups for this schedule
				// 		was rejected with an error
				.catch((jobOrSignupsError) => {
					// resolve this promise with the error
					resolve(jobOrSignupsError);
				});
		}),

	ProcessGSEScheduleCreditReminderNotifications: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			if (process.env.use === 'prod') {
				// set up vars
				const todayIsMondayOrWednesdayOrFriday = 
					moment().weekday() % 2 > 0;
				const notificationsToSend = [];
				const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
				const threeDaysAgo = moment().subtract(3, 'day').format('YYYY-MM-DD');
				// get a promise to retrieve all submitted schedules
				nesoDBQueries.ReturnAllDocsFromCollection('gseSubmittedSchedules')
					// if the promise is resolved with the docs
					.then((scheduleQueryResult) => {
						// set up container for notification retrieval promises
						const returnNoticationPromises = [];
						// for each submitted schedule
						scheduleQueryResult.docs.forEach((submittedGSESchedule) => {
							// clone param
							const scheduleClone = submittedGSESchedule;
							// determine the schedule's date and its start and end datetime
							const scheduleDate = scheduleClone.Date.slice(0, 10);
							const scheduleStartDatetimeRaw = 
								scheduleDate + 
								scheduleClone.StartTime.slice(10, 20);
							const scheduleStartDatetime = 
							moment(scheduleStartDatetimeRaw).isDST() ?
								moment(scheduleStartDatetimeRaw).subtract(1, 'hour') :
								moment(scheduleStartDatetimeRaw);
							const scheduleEndDatetime = 
							(scheduleClone.ShiftLength === '3.5 hours') ?
								moment(scheduleStartDatetime).add(3.5, 'hours') :
								moment(scheduleStartDatetime).add(7, 'hours');
							// if this schedule was yesterday or 
							// 		both of the following are the case:
							// 		-- today is Monday, Wednesday, or Friday
							// 		-- the schedule was three days ago or earlier
							if (
								moment(scheduleDate).isSame(yesterday) ||
								(
									todayIsMondayOrWednesdayOrFriday && 
									moment(scheduleDate).isSameOrBefore(threeDaysAgo)
								)
							) {
								// add the calculated times to the schedule so we don't have to recalculate them
								scheduleClone.scheduleStartDatetime =
									scheduleStartDatetime;
								scheduleClone.scheduleEndDatetime =
									scheduleEndDatetime;
								// push promise to return signup notifications for it
								returnNoticationPromises
									.push(module.exports.ReturnGSEScheduleCreditReminderNotificationsForOneSchedule(scheduleClone));
							}
						});
						// when all notification retrieval promises are resolved
						Promise.all(returnNoticationPromises)
							.then((notificationRetrievalResults) => {
								// extract the emails from the results
								// for each notification
								notificationRetrievalResults.forEach((notificationRetrievalResult) => {
									notificationRetrievalResult.forEach((notificationOrError) => {
										// if this is an email and not an error
										if (notificationOrError.emailType) {
											// push to notifications to send
											notificationsToSend.push(notificationOrError);
										}
									});
								});
								// send the emails
								module.exports.SendEmails(notificationsToSend)
									// if the promise is resolved with a result, then 
									// 		resolve this promise with the result
									.then((result) => { resolve(result); })
									// if the promise is rejected with an error, then 
									// 		reject this promise with an error
									.catch((error) => { reject(error); });
							});
					})
					// if the promise is rejected with an error, then reject this promise with an error
					.catch((error) => {
						reject(error);
					});
			} else {
				resolve('environment is not prod');
			}
		}),
};
