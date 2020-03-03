
// ----- PULL IN MODULES

const shortID = require('shortid');
const nesoDBQueries = require('./nesoDBQueries');
const nesoActiveDirectory = require('./nesoActiveDirectory');
const nesoErrors = require('./nesoErrors');

// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	ReturnHcOrgSettings: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the hcOrgSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcOrgSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),


	ReturnHcOrgWhitelistedDomains: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHcOrgSettings()
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


	ReturnHcOrgDataProcessingAllowed: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHcOrgSettings()
				// if the promise is resolved with the settings, 
				// 		then resolve this promise with the requested setting
				.then((settings) => {
					resolve({
						error: settings.error,
						dataProcessingAllowed: settings.docs[0].dataProcessingAllowed,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ReplaceOneHcOrgSetting: newSingleSettingObject =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHcOrgSettings()
				// if the promise is resolved with the settings, 
				//		then resolve this promise with the requested setting
				.then((existingSettings) => {
					// get a new version of all settings
					const newSettings = existingSettings.docs[0];
					// get an array containing the property key of newSingleSettingObject; 
					//		iterate over the array
					Object.keys(newSingleSettingObject).forEach((newSingleSettingKey) => {
						// in the new settings, replace relevant setting with value passed to this function
						newSettings[newSingleSettingKey] = newSingleSettingObject[newSingleSettingKey];
					});
					// get a promise to replace the settings in the emailSettings document collection
					nesoDBQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'hcOrgSettings')
						// if the promise is resolved with the counts, then resolve this promise with the counts
						.then((result) => {
							resolve(result);
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => {
							reject(error);
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ReturnAllTeams: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcOrgTeamsAll')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						hcOrgTeamsAll: result.docs,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ReturnDivDeptsWTeams: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcOrgDivDeptWTeams')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						divDeptWTeams: result.docs,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ReturnMission: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcOrgMission')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						mission: result.docs,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ReturnNonDivDeptTeams: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcOrgNonDivDeptTeams')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						nonDivDeptTeams: result.docs,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ConstructAndReturnDivDeptsWTeams: () =>
		new Promise(((resolve, reject) => {
			const queries = [
				nesoActiveDirectory.ReturnAllUsersByDivisionDepartment(),
				module.exports.ReturnAllTeams(),
			];
			Promise.all(queries)
				.then((resultsReturnArray) => {
					// set up vars
					let divDeptReturn;
					let teamsReturn;
					let divisionKeys;
					let deptKeys;
					const divDeptTempHolder = {};
					let divDeptTempHolderDivKeys;
					let divDeptTempHolderDeptKeys;
					const divDeptFinal = [];
					// extract the data
					resultsReturnArray.forEach((resultValue) => {
						if (resultValue.adUsersByDivisionDepartment) {
							divDeptReturn = resultValue.adUsersByDivisionDepartment[0];
						}
						if (resultValue.hcOrgTeamsAll) {
							teamsReturn = resultValue.hcOrgTeamsAll;
						}
					});
					// extract an array of all divisions
					divisionKeys = Object.keys(divDeptReturn);
					divisionKeys.forEach((divisionKey) => {
						if (divisionKey !== '_id') {
							// add division to temp holder
							divDeptTempHolder[divisionKey] = {};
							divDeptTempHolder[divisionKey].depts = {};
							// if this division has a presence on The Hub
							teamsReturn.forEach((team) => {
								if (team.adKey) {
									team.adKey.forEach((adKeyElement) => {
										if (adKeyElement.trim() === divisionKey.trim()) {
											divDeptTempHolder[divisionKey].hubScreenToken =
												team.pageToken;
										}
									});
								}
							});
							// extract an array of the departments in this division
							deptKeys = Object.keys(divDeptReturn[divisionKey]);
							// for each department in this division
							deptKeys.forEach((deptKey) => {
								// add department to final
								divDeptTempHolder[divisionKey].depts[deptKey] = {};
								// if this department has a presence on The Hub
								teamsReturn.forEach((team) => {
									if (team.adKey) {
										team.adKey.forEach((adKeyElement) => {
											if (adKeyElement.trim() === deptKey.trim()) {
												divDeptTempHolder[divisionKey].depts[deptKey].hubScreenToken =
													team.pageToken;
											}
										});
									}
								});
								// add members to department
								divDeptTempHolder[divisionKey].depts[deptKey].members =
									divDeptReturn[divisionKey][deptKey].members;
							});
						}
					});
					// note: what we're doing next is essentially converting an object to an array
					// extract into array from object its "child" / first level keys;
					// 		these keys correspond to division names
					divDeptTempHolderDivKeys = Object.keys(divDeptTempHolder);
					// sort division keys alphabetically
					divDeptTempHolderDivKeys.sort();
					// for each division key
					divDeptTempHolderDivKeys.forEach((divKeyValue) => {
						// if it's not the mongo id (i.e., it's actually a division)
						if (divKeyValue !== '_id') {
							// create a division object with name and react key and empty depts array
							const divObject = {
								name: divKeyValue,
								reactKey: shortID.generate(),
								depts: [],
							};
							// is this division has a hubScreenToken
							if (divDeptTempHolder[divKeyValue].hubScreenToken) {
								// add it to the division object
								divObject.hubScreenToken = divDeptTempHolder[divKeyValue].hubScreenToken;
							}
							// if this division has an orgChart
							if (divDeptTempHolder[divKeyValue].orgChart) {
								// add it to the division object
								divObject.orgChart = divDeptTempHolder[divKeyValue].orgChart;
							}
							// extract into array from object its "child" / first level keys;
							// 		these keys correspond to department names
							divDeptTempHolderDeptKeys = Object.keys(divDeptTempHolder[divKeyValue].depts);
							// sort department keys alphabetically
							divDeptTempHolderDeptKeys.sort();

							// for each department key
							divDeptTempHolderDeptKeys.forEach((deptKeyValue) => {
								// create a department object with name and react key and an empty members array
								const deptObject = {
									name: deptKeyValue,
									reactKey: shortID.generate(),
									members: [],
								};
								// is this department has a hubScreenToken
								if (divDeptTempHolder[divKeyValue].depts[deptKeyValue].hubScreenToken) {
									// add it to the department object
									deptObject.hubScreenToken =
										divDeptTempHolder[divKeyValue].depts[deptKeyValue].hubScreenToken;
								}
								// for each member in this department
								divDeptTempHolder[divKeyValue].depts[deptKeyValue]
									.members.forEach((member) => {
										// create a member object
										const memberObject = {
											account: member.account,
											displayName: member.displayName,
											firstName: member.firstName,
											lastName: member.lastName,
											firstInitial: member.firstInitial,
											lastInitial: member.lastInitial,
											title: member.title,
											email: member.email,
											officePhone: member.officePhone,
											mobilePhone: member.mobilePhone,
											photoURL: `/_layouts/15/userphoto.aspx?size=S&accountname=${member.account}@mos.org`,
											reactKey: shortID.generate(),
										};
										deptObject.members.push(memberObject);
									});
								// push the department object to the depts array of the division object
								divObject.depts.push(deptObject);
							});
							// push the division object to the divDeptFinal divDept array
							divDeptFinal.push(divObject);
						}
					});
					// resolve this promise with the data
					resolve(divDeptFinal);
				})
				.then((error) => {
					reject(error);
				});
		})),

	ReturnTeamNameWeightRelativeToAnother: (a, b) => {
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	},

	ConstructAndReturnNonDivDeptTeams: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all docs from the hcOrgTeamsAll collection
			module.exports.ReturnAllTeams()
				// if the promise is resolved with a result
				.then((result) => {
					// then construct a relevantTeams object
					const relevantTeams = [];
					result.hcOrgTeamsAll.forEach((teamValue) => {
						if (teamValue.type === 'Team') {
							relevantTeams.push({
								name: teamValue.name,
								pageToken: teamValue.pageToken,
								reactKey: shortID.generate(),
							});
						}
					});
					relevantTeams.sort(module.exports.ReturnTeamNameWeightRelativeToAnother);
					resolve(relevantTeams);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	DeleteDivDeptsWTeamsFromDatabase: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the adDepartments document collection
			nesoDBQueries.DeleteAllDocsFromCollection('hcOrgDivDeptWTeams')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	DeleteNonDivDeptTeamsFromDatabase: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the adDepartments document collection
			nesoDBQueries.DeleteAllDocsFromCollection('hcOrgNonDivDeptTeams')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	AddDivDeptsWTeamsToDatabase: divDeptsWTeamsArray =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(divDeptsWTeamsArray, 'hcOrgDivDeptWTeams')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	AddNonDivDeptTeamsToDatabase: nonDivDeptTeamsArray =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(nonDivDeptTeamsArray, 'hcOrgNonDivDeptTeams')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		})),

	ProcessHcOrgDivDeptWTeamsData: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnHcOrgDataProcessingAllowed()
				// if the promise is resolved with the setting
				.then((hcOrgDataProcessingAllowed) => {
					// if it's ok to process ad users
					if (hcOrgDataProcessingAllowed.dataProcessingAllowed === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneHcOrgSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneHcOrgSettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ConstructAndReturnDivDeptsWTeams()
								
								
								// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnDivDeptsWTeamsArray) => {
										// get a promise to delete all ad users from the database
										module.exports.DeleteDivDeptsWTeamsFromDatabase()
											// if the promise to delete all ad users from the database was resolved
											.then((deleteDivDeptsWTeamsFromDatabaseResults) => {
												// get a promise to add ad users from csv to the database
												module.exports.AddDivDeptsWTeamsToDatabase(returnDivDeptsWTeamsArray)
													// if the promise to add ad users from csv to the database was resolved
													.then((addDivDeptsWTeamsToDatabaseResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneHcOrgSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneHcOrgSettingSecondResult) => {
																// resolve this promise with a message
																resolve({
																	error: false,
																});
															})
															// if the promise to set dataProcessingNow 
															//		to false was rejected with an error
															.catch((error) => {
																// reject this promise with the error
																reject(error);
															});
													})
													// if the promise to add ad users from 
													//		csv to the database was rejected with an error
													.catch((addDivDeptsWTeamsToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneHcOrgSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneHcOrgSettingSecondResult) => {
																// reject this promise with the error
																reject(addDivDeptsWTeamsToDatabaseError);
															})
															// if the promise to add ad users from 
															// 		csv to the database was rejected with an error
															.catch((replaceOneHcOrgSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addDivDeptsWTeamsToDatabaseError.mongoDBErrorDetails,
																		replaceOneHcOrgSettingError.mongoDBErrorDetails,
																	],
																};
																// process error
																nesoErrors.ProcessError(errorToReport);
																// reject this promise with the error
																reject(errorToReport);
															});
													});
											})
											// if the promise to delete all ad users from 
											// 		the database was rejected with an error
											.catch((deleteDivDeptsWTeamsFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneHcOrgSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneHcOrgSettingSecondResult) => {
														// reject this promise with the error
														reject(deleteDivDeptsWTeamsFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteDivDeptsWTeamsFromDatabaseError.mongoDBErrorDetails,
																replaceOneADSettingError.mongoDBErrorDetails,
															],
														};
														// process error
														nesoErrors.ProcessError(errorToReport);
														// reject this promise with the error
														reject(errorToReport);
													});
											});
									})
									// if the promise to get all ad users from csv was rejected with an error
									.catch((returnDivDeptsWTeamsError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneHcOrgSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow 
											// 		to false was resolved with the result
											.then((replaceOneHcOrgSettingSecondResult) => {
												// reject this promise with the error
												reject(returnDivDeptsWTeamsError);
											})
											// if the promise to add ad users from csv 
											// 		to the database was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnDivDeptsWTeamsError.mongoDBErrorDetails,
														replaceOneADSettingError.mongoDBErrorDetails,
													],
												};
												// process error
												nesoErrors.ProcessError(errorToReport);
												// reject this promise with the error
												reject(errorToReport);
											});
									});
							})
							// if the promise to set dataProcessingNow to true was rejected with an error, 
							// 		then reject this promise with the error
							.catch((error) => {
								reject(error);
							});
						// if it's NOT ok to process ad users
					} else {
						// reject this promise with the error
						reject({
							error: true,
							settingsError: 'dataProcessingStatus === false',
						});
					}
				})
				// if the promise to retrieve ad users processing status is rejected with an error, 
				// 		then reject this promise with the error
				.catch((error) => {
					reject(error);
				});
		})),

	ProcessNonDivDeptTeamsData: () => 
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to construct and return non-division, non-department teams
			module.exports.ConstructAndReturnNonDivDeptTeams()
				// if the promise is resolved with a result
				.then((returnArrayOfNonDivDeptTeams) => {
					// get a promise to delete all ad users from the database
					module.exports.DeleteNonDivDeptTeamsFromDatabase()
						// if the promise to delete all ad users from the database was resolved
						.then((deleteNonDivDeptTeamsFromDatabaseResults) => {
							// get a promise to add ad users from csv to the database
							module.exports.AddNonDivDeptTeamsToDatabase(returnArrayOfNonDivDeptTeams)
								// if the promise to add ad users from csv to the database was resolved
								.then((addNonDivDeptTeamsToDatabaseResult) => {
									resolve({ error: false });
								})
								// if the promise to add ad users from 
								//		csv to the database was rejected with an error
								.catch((addNonDivDeptTeamsToDatabaseError) => {
									// construct a custom error
									const errorToReport = {
										error: true,
										mongoDBError: true,
										addNonDivDeptTeamsToDatabaseError,
									};
									// process error
									nesoErrors.ProcessError(errorToReport);
									// reject this promise with the error
									reject(errorToReport);
								});
						})
						// if the promise to delete all ad users from 
						// 		the database was rejected with an error
						.catch((deleteNonDivDeptTeamsFromDatabaseError) => {
							// construct a custom error
							const errorToReport = {
								error: true,
								mongoDBError: true,
								deleteNonDivDeptTeamsFromDatabaseError,
							};
							// process error
							nesoErrors.ProcessError(errorToReport);
							// reject this promise with the error
							reject(errorToReport);
						});
				})
				// if the promise is rejected with an error
				.catch((returnNonDivDeptTeamsError) => {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						returnNonDivDeptTeamsError,
					};
					// process error
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
				});
		}),


	ReturnAllHcOrgData: () =>
		new Promise(((resolve, reject) => {
			const queries = [
				module.exports.ReturnDivDeptsWTeams(),
				module.exports.ReturnNonDivDeptTeams(),
			];
			Promise.all(queries)
				.then((allQueryResults) => {
					// extract data from results and construct an object to return
					const resolution = {
						error: false,
						docs: {},
					};
					allQueryResults.forEach((resultValue) => {
						if (resultValue.divDeptWTeams) {
							resolution.docs.divDeptWTeams = resultValue.divDeptWTeams;
						}
						if (resultValue.nonDivDeptTeams) {
							resolution.docs.nonDivDeptTeams = resultValue.nonDivDeptTeams;
						}
					});
					resolve(resolution);
				})
				.catch((error) => {
					reject(error);
				});
		})),

};
