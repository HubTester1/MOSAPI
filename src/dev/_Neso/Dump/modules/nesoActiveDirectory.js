// ----- PULL IN MODULES

const fse = require('fs-extra');
const csv = require('csvtojson');

const nesoDBQueries = require('./nesoDBQueries');
const nesoUtilities = require('./nesoUtilities');
const nesoErrors = require('./nesoErrors');
const nesoDBConnection = require('./nesoDBConnection');


// ----- DEFINE ACTIVE DIRECTORY FUNCTIONS

module.exports = {

	// SETTINGS, STATUS, CORS, UTILS

	ReturnADSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReturnADDataProcessingStatus: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnADSettings()
				// if the promise is resolved with the settings, 
				// 		then resolve this promise with the requested setting
				.then((settings) => {
					resolve({
						error: settings.error,
						dataProcessingStatus: settings.docs[0].dataProcessingStatus,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReturnADDataProcessingNow: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnADSettings()
				// if the promise is resolved with the settings, 
				// 		then resolve this promise with the requested setting
				.then((settings) => {
					resolve({
						error: settings.error,
						dataProcessingNow: settings.docs[0].dataProcessingNow,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReturnADCSVSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnADSettings()
				// if the promise is resolved with the settings, 
				// 		then resolve this promise with the requested setting
				.then((settings) => {
					resolve({
						error: settings.error,
						csv: settings.docs[0].csvOptions,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReturnADWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnADSettings()
				// if the promise is resolved with the settings, 
				//		then resolve this promise with the requested setting
				.then((settings) => {
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReplaceAllADSettings: newSettings =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnADSettings()
				// if the promise is resolved with the settings, 
				// 		then resolve this promise with the requested setting
				.then((existingSettings) => {
					// get a promise to replace the settings in the emailSettings document collection
					nesoDBQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'adSettings')
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
		}),

	ReplaceOneADSetting: newSingleSettingObject =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnADSettings()
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
					nesoDBQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'adSettings')
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
		}),

	ReturnNewADUsersFilePathAndName: currentFilePathAndName =>
		`${currentFilePathAndName.slice(0, currentFilePathAndName.length - 4)}Copy.csv`,

	ReturnUserNameWeightRelativeToAnother: (a, b) => {
		if (a.lastName < b.lastName) {
			return -1;
		}
		if (a.lastName > b.lastName) {
			return 1;
		}
		if (a.firstName < b.firstName) {
			return -1;
		}
		if (a.firstName > b.firstName) {
			return 1;
		}
		return 0;
	},

	// DB DELETIONS

	DeleteAllADUsersFromDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adUsers')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	DeleteAllADUsersByDivisionDepartmentFromDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents 
			//		from the adUsersByDivisionDepartment document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adUsersByDivisionDepartment')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	DeleteAllADDepartmentsFromDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adDepartments document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adDepartments')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	DeleteAllADManagersSimpleFromDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adManagersFlat document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adManagersFlat')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	DeleteAllADManagersWithFullFlatDownlinesFromDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the 
			// 		adManagersWithFullFlatDownlines document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adManagersWithFullFlatDownlines')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	DeleteAllADManagersWithFullHierarchicalDownlinesFromDatabase: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the 
			// 		adManagersWithFullHierarchicalDownlines document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adManagersWithFullHierarchicalDownlines')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	
	// DB INSERTIONS

	AddAllADUsersToDatabase: adUsers =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(adUsers, 'adUsers')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	AddAllADUsersByDivisionDepartmentToDatabase: adUsersByDivisionDepartment =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(adUsersByDivisionDepartment, 'adUsersByDivisionDepartment')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	AddAllADDepartmentsToDatabase: adDepartments =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(adDepartments, 'adDepartments')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	AddAllADManagersSimpleToDatabase: adManagers =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(adManagers, 'adManagersFlat')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	AddAllADManagersWithFullFlatDownlinesToDatabase: adManagers =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to insert all documents into the 
			// 		adManagersWithFullFlatDownlines document collection
			nesoDBQueries.InsertDocIntoCollection(adManagers, 'adManagersWithFullFlatDownlines')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	AddAllADManagersWithFullHierarchicalDownlinesToDatabase: adManagers =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to insert all documents into the 
			// 		adManagersWithFullHierarchicalDownlines document collection
			nesoDBQueries.InsertDocIntoCollection(adManagers, 'adManagersWithFullHierarchicalDownlines')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	// PARENT PROCESSES

	// scheduled
	ProcessADUsersData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnADDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((adUsersDataProcessingStatus) => {
					// if it's ok to process ad users
					if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneADSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneActiveDirectorySettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ReturnAllADUsersFromCSVWithLegacyPhoneNumbers()
									// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnAllActiveDirectoryUsersFromCSVResult) => {
										// extract the data from the result
										const adUsers = returnAllActiveDirectoryUsersFromCSVResult.activeDirectoryUsers;
										// get a promise to delete all ad users from the database
										module.exports.DeleteAllADUsersFromDatabase()
											// if the promise to delete all ad users from the database was resolved
											.then((deleteAllActiveDirectoryUsersFromDatabaseResult) => {
												// get a promise to add ad users from csv to the database
												module.exports.AddAllADUsersToDatabase(adUsers)
													// if the promise to add ad users from csv to the database was resolved
													.then((addAllActiveDirectoryUsersToDatabaseResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
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
													.catch((addAllActiveDirectoryUsersToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// reject this promise with the error
																reject(addAllActiveDirectoryUsersToDatabaseError);
															})
															// if the promise to add ad users from 
															// 		csv to the database was rejected with an error
															.catch((replaceOneADSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllActiveDirectoryUsersToDatabaseError.mongoDBErrorDetails,
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
											// if the promise to delete all ad users from 
											// 		the database was rejected with an error
											.catch((deleteAllActiveDirectoryUsersFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneADSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneActiveDirectorySettingSecondResult) => {
														// reject this promise with the error
														reject(deleteAllActiveDirectoryUsersFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllActiveDirectoryUsersFromDatabaseError.mongoDBErrorDetails,
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
									.catch((returnAllActiveDirectoryUsersFromCSVError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneADSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow 
											// 		to false was resolved with the result
											.then((replaceOneActiveDirectorySettingSecondResult) => {
												// reject this promise with the error
												reject(returnAllActiveDirectoryUsersFromCSVError);
											})
											// if the promise to add ad users from csv 
											// 		to the database was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllActiveDirectoryUsersFromCSVError.mongoDBErrorDetails,
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
		}),
	// scheduled
	ProcessADUsersByDivisionDepartmentData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnADDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((adUsersDataProcessingStatus) => {
					// if it's ok to process ad users
					if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneADSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneActiveDirectorySettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ReturnAllADUsersByDivisionDepartmentFromCSV()
									// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnAllADUsersByDivisionDepartmentFromADUsersResult) => {
										// extract the data from the result
										const {
											adUsersByDivisionDepartment,
										} =
											returnAllADUsersByDivisionDepartmentFromADUsersResult;
										// get a promise to delete all ad users from the database
										module.exports.DeleteAllADUsersByDivisionDepartmentFromDatabase()
											// if the promise to delete all ad users from the database was resolved
											.then((deleteAllADUsersByDivisionDepartmentFromDatabaseResult) => {
												// get a promise to add ad users from csv to the database
												module.exports
													.AddAllADUsersByDivisionDepartmentToDatabase(adUsersByDivisionDepartment)
													// if the promise to add ad users from csv to the database was resolved
													.then((addAllADUsersByDivisionDepartmentToDatabaseResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															// 		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// resolve this promise with a message
																resolve({
																	error: false,
																});
															})
															// if the promise to set dataProcessingNow 
															// 		to false was rejected with an error
															.catch((error) => {
																// reject this promise with the error
																reject(error);
															});
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((addAllADUsersByDivisionDepartmentToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow to false 
															// 		was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// reject this promise with the error
																reject(addAllADUsersByDivisionDepartmentToDatabaseError);
															})
															// if the promise to add ad users from csv 
															// 		to the database was rejected with an error
															.catch((replaceOneADSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllADUsersByDivisionDepartmentToDatabaseError
																			.mongoDBErrorDetails,
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
											// if the promise to delete all ad users from the database 
											// 		was rejected with an error
											.catch((deleteAllADUsersByDivisionDepartmentFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneADSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneActiveDirectorySettingSecondResult) => {
														// reject this promise with the error
														reject(deleteAllADUsersByDivisionDepartmentFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllADUsersByDivisionDepartmentFromDatabaseError
																	.mongoDBErrorDetails,
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
									.catch((returnAllADUsersByDivisionDepartmentFromADUsersError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneADSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow to false 
											// 		was resolved with the result
											.then((replaceOneActiveDirectorySettingSecondResult) => {
												// reject this promise with the error
												reject(returnAllADUsersByDivisionDepartmentFromADUsersError);
											})
											// if the promise to add ad users from csv to the database 
											// 		was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllADUsersByDivisionDepartmentFromADUsersError
															.mongoDBErrorDetails,
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
		}),
	// scheduled
	ProcessADDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnADDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((adUsersDataProcessingStatus) => {
					// if it's ok to process ad users
					if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneADSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneActiveDirectorySettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ReturnAllADDepartmentsFromADUsersByDivisionDepartment()
									// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnAllADDepartmentsFromADUsersByDivisionDepartmentResult) => {
										// get a promise to delete all ad depts from the database
										module.exports.DeleteAllADDepartmentsFromDatabase()
											// if the promise to delete all ad depts from the database was resolved
											.then((deleteAllActiveDirectoryDeptsFromDatabaseResult) => {
												// extract data (just to keep line length short, really)
												const {
													adDepartments,
												} =
													returnAllADDepartmentsFromADUsersByDivisionDepartmentResult;
												// get a promise to add ad users from csv to the database
												module.exports
													.AddAllADDepartmentsToDatabase(adDepartments)
													// if the promise to add ad users from csv to the database was resolved
													.then((addAllActiveDirectoryDepartmentsToDatabaseResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
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
													.catch((addAllActiveDirectoryDepartmentsToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// reject this promise with the error
																reject(addAllActiveDirectoryDepartmentsToDatabaseError);
															})
															// if the promise to add ad users from 
															// 		csv to the database was rejected with an error
															.catch((replaceOneADSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllActiveDirectoryDepartmentsToDatabaseError
																			.mongoDBErrorDetails,
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
											// if the promise to delete all ad users from 
											// 		the database was rejected with an error
											.catch((deleteAllActiveDirectoryDeptsFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneADSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneActiveDirectorySettingSecondResult) => {
														// reject this promise with the error
														reject(deleteAllActiveDirectoryDeptsFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllActiveDirectoryDeptsFromDatabaseError.mongoDBErrorDetails,
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
									.catch((returnAllADDepartmentsFromADUsersByDivisionDepartmentError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneADSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow 
											// 		to false was resolved with the result
											.then((replaceOneActiveDirectorySettingSecondResult) => {
												// reject this promise with the error
												reject(returnAllADDepartmentsFromADUsersByDivisionDepartmentError);
											})
											// if the promise to add ad users from csv 
											// 		to the database was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllADDepartmentsFromADUsersByDivisionDepartmentError
															.mongoDBErrorDetails,
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
		}),
	// scheduled
	ProcessADManagersSimple: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnADDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((adUsersDataProcessingStatus) => {
					// if it's ok to process ad users
					if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneADSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneActiveDirectorySettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ReturnAllADManagersSimpleFromADUsersByDivisionDepartment()
									// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnAllADManagersFromADUsersByDivisionDepartmentResult) => {
										// get a promise to delete all ad depts from the database
										module.exports.DeleteAllADManagersSimpleFromDatabase()
											// if the promise to delete all ad depts from the database was resolved
											.then((deleteAllADManagersFromDatabaseResult) => {
												// extract data (just to keep line length short, really)
												const {
													adManagers,
												} =
													returnAllADManagersFromADUsersByDivisionDepartmentResult;
												// get a promise to add ad users from csv to the database
												module.exports
													.AddAllADManagersSimpleToDatabase(adManagers)
													// if the promise to add ad users from csv to the database was resolved
													.then((addAllActiveDirectoryManagersToDatabaseResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
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
													.catch((addAllActiveDirectoryDepartmentsToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// reject this promise with the error
																reject(addAllActiveDirectoryDepartmentsToDatabaseError);
															})
															// if the promise to add ad users from 
															// 		csv to the database was rejected with an error
															.catch((replaceOneADSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllActiveDirectoryDepartmentsToDatabaseError
																			.mongoDBErrorDetails,
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
											// if the promise to delete all ad users from 
											// 		the database was rejected with an error
											.catch((deleteAllActiveDirectoryDeptsFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneADSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneActiveDirectorySettingSecondResult) => {
														// reject this promise with the error
														reject(deleteAllActiveDirectoryDeptsFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllActiveDirectoryDeptsFromDatabaseError.mongoDBErrorDetails,
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
									.catch((returnAllADDepartmentsFromADUsersByDivisionDepartmentError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneADSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow 
											// 		to false was resolved with the result
											.then((replaceOneActiveDirectorySettingSecondResult) => {
												// reject this promise with the error
												reject(returnAllADDepartmentsFromADUsersByDivisionDepartmentError);
											})
											// if the promise to add ad users from csv 
											// 		to the database was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllADDepartmentsFromADUsersByDivisionDepartmentError
															.mongoDBErrorDetails,
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
		}),
	// scheduled
	ProcessADManagersWithFullFlatDownlines: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnADDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((adUsersDataProcessingStatus) => {
					// if it's ok to process ad users
					if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneADSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneActiveDirectorySettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ReturnAllADManagersWithFullFlatDownlinesFromDBQueries()
									// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnResult) => {
										// get a promise to delete all ad depts from the database
										module.exports.DeleteAllADManagersWithFullFlatDownlinesFromDatabase()
											// if the promise to delete all ad depts from the database was resolved
											.then((deleteResult) => {
												// extract data (just to keep line length short, really)
												const {
													adManagers,
												} =
													returnResult;
												// get a promise to add ad users from csv to the database
												module.exports
													.AddAllADManagersWithFullFlatDownlinesToDatabase(adManagers)
													// if the promise to add ad users from csv to the database was resolved
													.then((addResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
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
													.catch((addAllActiveDirectoryDepartmentsToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// reject this promise with the error
																reject(addAllActiveDirectoryDepartmentsToDatabaseError);
															})
															// if the promise to add ad users from 
															// 		csv to the database was rejected with an error
															.catch((replaceOneADSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllActiveDirectoryDepartmentsToDatabaseError
																			.mongoDBErrorDetails,
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
											// if the promise to delete all ad users from 
											// 		the database was rejected with an error
											.catch((deleteAllActiveDirectoryDeptsFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneADSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneActiveDirectorySettingSecondResult) => {
														// reject this promise with the error
														reject(deleteAllActiveDirectoryDeptsFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllActiveDirectoryDeptsFromDatabaseError.mongoDBErrorDetails,
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
									.catch((returnAllADDepartmentsFromADUsersByDivisionDepartmentError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneADSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow 
											// 		to false was resolved with the result
											.then((replaceOneActiveDirectorySettingSecondResult) => {
												// reject this promise with the error
												reject(returnAllADDepartmentsFromADUsersByDivisionDepartmentError);
											})
											// if the promise to add ad users from csv 
											// 		to the database was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllADDepartmentsFromADUsersByDivisionDepartmentError
															.mongoDBErrorDetails,
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
		}),
	// scheduled
	ProcessADManagersWithFullHierarchicalDownlines: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve ad processing status
			module.exports.ReturnADDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((adUsersDataProcessingStatus) => {
					// if it's ok to process ad users
					if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneADSetting({
							dataProcessingNow: true,
						})
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneActiveDirectorySettingResult) => {
								// get a promise to get all ad users from csv
								module.exports.ReturnAllADManagersWithFullHierarchicalDownlinesFromDBQueries()
									// if the promise to get all ad users from csv was resolved with the ad users
									.then((returnAllADManagersWithFullHierarchicalDownlineFromDBQueriesResult) => {
										// get a promise to delete all ad depts from the database
										module.exports.DeleteAllADManagersWithFullHierarchicalDownlinesFromDatabase()
											// if the promise to delete all ad depts from the database was resolved
											.then((deleteResult) => {
												// extract data (just to keep line length short, really)
												const {
													adManagers,
												} =
													returnAllADManagersWithFullHierarchicalDownlineFromDBQueriesResult;
												// get a promise to add ad users from csv to the database
												module.exports
													.AddAllADManagersWithFullHierarchicalDownlinesToDatabase(adManagers)
													// if the promise to add ad users from csv to the database was resolved
													.then((addResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
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
													.catch((addAllActiveDirectoryDepartmentsToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneADSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow 
															//		to false was resolved with the result
															.then((replaceOneActiveDirectorySettingSecondResult) => {
																// reject this promise with the error
																reject(addAllActiveDirectoryDepartmentsToDatabaseError);
															})
															// if the promise to add ad users from 
															// 		csv to the database was rejected with an error
															.catch((replaceOneADSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllActiveDirectoryDepartmentsToDatabaseError
																			.mongoDBErrorDetails,
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
											// if the promise to delete all ad users from 
											// 		the database was rejected with an error
											.catch((deleteAllActiveDirectoryDeptsFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneADSetting({
													dataProcessingNow: false,
												})
													// if the promise to set dataProcessingNow 
													// 		to false was resolved with the result
													.then((replaceOneActiveDirectorySettingSecondResult) => {
														// reject this promise with the error
														reject(deleteAllActiveDirectoryDeptsFromDatabaseError);
													})
													// if the promise to add ad users from csv 
													// 		to the database was rejected with an error
													.catch((replaceOneADSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllActiveDirectoryDeptsFromDatabaseError.mongoDBErrorDetails,
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
									.catch((returnAllADDepartmentsFromADUsersByDivisionDepartmentError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneADSetting({
											dataProcessingNow: false,
										})
											// if the promise to set dataProcessingNow 
											// 		to false was resolved with the result
											.then((replaceOneActiveDirectorySettingSecondResult) => {
												// reject this promise with the error
												reject(returnAllADDepartmentsFromADUsersByDivisionDepartmentError);
											})
											// if the promise to add ad users from csv 
											// 		to the database was rejected with an error
											.catch((replaceOneADSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllADDepartmentsFromADUsersByDivisionDepartmentError
															.mongoDBErrorDetails,
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
		}),

	// DATA MANIPULATION

	ReturnAllADUsersFromCSV: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve excel settings
			module.exports.ReturnADCSVSettings()
				// if the promise to retrieve excel settings is resolved with the settings
				.then((settings) => {
					// try to resolve this promise with the ad users data
					try {
						// make a copy of the file to read
						const newUsersFilePathAndName =
							module.exports.ReturnNewADUsersFilePathAndName(settings.csv.usersFilePathAndName);
						fse
							.copy(settings.csv.usersFilePathAndName, newUsersFilePathAndName, { overwrite: true })
							.then(() => {
								// get data from the csv file
								csv().fromFile(newUsersFilePathAndName)
									// when the data has been parsed
									.on('end_parsed', (adUsersRaw) => {
										// console.log(adUsersRaw);
										// set up an empty array to receive a transformed version of the data
										const adUsersTransformed = [];
										// iterate over raw users array
										adUsersRaw.forEach((adUserRaw, adUserRawIndex) => {
											// ignore any empty results; we test against the value 
											// 		that will be the unique ID because we can't 
											//		use any results without a unique ID anyway
											if (typeof (adUserRaw.userPrincipalName) !== 'undefined') {
												// if this user is in the TrackIt Users or Contractors OU
												const adSPathArray = adUserRaw.ADsPath.split(',');
												if (
													// adSPathArray has multiple elements
													adSPathArray.length > 1 &&
													// adSPathArray[1] is either TrackIt Users or Contractors
													(adSPathArray[1] === 'OU=TrackIt Users' || adSPathArray[1] === 'OU=Contractors')
												) {
													// extract and transform some of the data
													const userAccount = nesoUtilities.StrInStr({
														incomingHaystack: adUserRaw.userPrincipalName.toLowerCase(),
														incomingNeedle: '@mos.org',
														flag: 1,
													});
													// TEMP
													const allGroupsAllDataArray = adUserRaw.memberOf.split(', ');
													const securityGroups = [];
													allGroupsAllDataArray
														.forEach((oneGroupWithAllDataString, oneGroupWithAllDataStringIndex) => {
															const oneGroupWithAllDataArray = oneGroupWithAllDataString.split(',');
															if (
																// oneGroupWithAllDataArray has multiple elements
																oneGroupWithAllDataArray.length > 1 &&
																// oneGroupWithAllDataArray[1] contains 'Groups'
																nesoUtilities.StrInStr({
																	incomingHaystack: oneGroupWithAllDataArray[1],
																	incomingNeedle: 'Groups',
																}) &&
																// oneGroupWithAllDataArray[1] does not contain 'Exchange'
																nesoUtilities.StrInStr({
																	incomingHaystack: oneGroupWithAllDataArray[1],
																	incomingNeedle: 'Exchange',
																}) === false &&
																// oneGroupWithAllDataArray[1] does not contain 'FileMaker'
																nesoUtilities.StrInStr({
																	incomingHaystack: oneGroupWithAllDataArray[1],
																	incomingNeedle: 'FileMaker',
																}) === false
															) {
																securityGroups.push(nesoUtilities.StrInStr({
																	incomingHaystack: oneGroupWithAllDataArray[0],
																	incomingNeedle: 'CN=',
																	flag: 3,
																}));
															}
														});

													// push a transformed user to adUsersTransformed
													adUsersTransformed.push({
														account: userAccount,
														employeeID: adUserRaw.employeeID,
														firstName: adUserRaw.givenName,
														lastName: adUserRaw.sn,
														firstInitial: adUserRaw.givenName.slice(0, 1).toUpperCase(),
														lastInitial: adUserRaw.sn.slice(0, 1).toUpperCase(),
														displayName: adUserRaw.displayName,
														title: adUserRaw.title,
														email: adUserRaw.mail,
														officePhone: adUserRaw.telephoneNumber,
														mobilePhone: adUserRaw.mobile,
														manager: adUserRaw.manager,
														department: adUserRaw.department,
														division: adUserRaw.division,
														securityGroups,
													});
												}
											}
										});

										// resolve this promise with a message
										resolve({
											error: false,
											csvError: false,
											activeDirectoryUsers: adUsersTransformed,
										});
										fse
											.remove(newUsersFilePathAndName)
											.then(() => {
												// console.log('FILE REMOVED');
											})
											.catch((err) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													fileRemovalError: true,
												};
												// process error
												nesoErrors.ProcessError(errorToReport);
												// reject this promise with an error
												reject(errorToReport);
											});
									});
							})
							.catch((err) => {
								// construct a custom error
								const errorToReport = {
									error: true,
									fileCopyError: true,
								};
								// process error
								nesoErrors.ProcessError(errorToReport);
								// reject this promise with an error
								reject(errorToReport);
							});
						// if there was an error
					} catch (exception) {
						// console.log(exception);
						// construct a custom error
						const errorToReport = {
							error: true,
							csvError: true,
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with an error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReturnAllADUsersFromCSVWithLegacyPhoneNumbers: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve excel settings
			module.exports.ReturnADCSVSettings()
				// if the promise to retrieve excel settings is resolved with the settings
				.then((settings) => {
					// try to resolve this promise with the ad users data
					try {
						// make a copy of the file to read
						const newUsersFilePathAndName =
							module.exports.ReturnNewADUsersFilePathAndName(settings.csv.usersFilePathAndName);
						fse
							.copy(settings.csv.usersFilePathAndName, newUsersFilePathAndName, { overwrite: true })
							.then(() => {
								// get data from the csv file
								csv().fromFile(newUsersFilePathAndName)
									// when the data has been parsed
									.on('end_parsed', (adUsersRaw) => {
										// console.log(adUsersRaw);
										// get a promise to retrieve all documents from the adUsers document collection
										nesoDBQueries.ReturnAllDocsFromCollection('legacyPhoneNumbers')
											// if the promise is resolved with the docs, 
											// 		then resolve this promise with the docs
											.then((result) => {
												const legacyPhoneNumbersArray = result.docs;
												// console.log(legacyPhoneNumbersArray);
												// set up an empty array to receive a transformed version of the data
												const adUsersTransformed = [];
												// iterate over raw users array
												adUsersRaw.forEach((adUserRaw, adUserRawIndex) => {
													// ignore any empty results; we test against the value 
													// 		that will be the unique ID because we can't 
													//		use any results without a unique ID anyway
													if (typeof (adUserRaw.userPrincipalName) !== 'undefined') {
														// if this user is in the TrackIt Users or Contractors OU
														const adSPathArray = adUserRaw.ADsPath.split(',');
														if (
															// adSPathArray has multiple elements
															adSPathArray.length > 1 &&
															// adSPathArray[1] is either TrackIt Users or Contractors
															(adSPathArray[1] === 'OU=TrackIt Users' || adSPathArray[1] === 'OU=Contractors')
														) {
															// extract and transform some of the data
															const userAccount = nesoUtilities.StrInStr({
																incomingHaystack: adUserRaw.userPrincipalName.toLowerCase(),
																incomingNeedle: '@mos.org',
																flag: 1,
															});
															// TEMP
															let userOfficePhone = adUserRaw.telephoneNumber;
															const allGroupsAllDataArray = adUserRaw.memberOf.split(', ');
															const securityGroups = [];
															allGroupsAllDataArray
																.forEach((oneGroupWithAllDataString, oneGroupWithAllDataStringIndex) => {
																	const oneGroupWithAllDataArray = oneGroupWithAllDataString.split(',');
																	if (
																		// oneGroupWithAllDataArray has multiple elements
																		oneGroupWithAllDataArray.length > 1 &&
																		// oneGroupWithAllDataArray[1] contains 'Groups'
																		nesoUtilities.StrInStr({
																			incomingHaystack: oneGroupWithAllDataArray[1],
																			incomingNeedle: 'Groups',
																		}) &&
																		// oneGroupWithAllDataArray[1] does not contain 'Exchange'
																		nesoUtilities.StrInStr({
																			incomingHaystack: oneGroupWithAllDataArray[1],
																			incomingNeedle: 'Exchange',
																		}) === false &&
																		// oneGroupWithAllDataArray[1] does not contain 'FileMaker'
																		nesoUtilities.StrInStr({
																			incomingHaystack: oneGroupWithAllDataArray[1],
																			incomingNeedle: 'FileMaker',
																		}) === false
																	) {
																		securityGroups.push(nesoUtilities.StrInStr({
																			incomingHaystack: oneGroupWithAllDataArray[0],
																			incomingNeedle: 'CN=',
																			flag: 3,
																		}));
																	}
																});
															// if the user doesn't have a proper office phone
															if (userOfficePhone.length < 5) {
																legacyPhoneNumbersArray.forEach((personObject, personIndex) => {
																	if (personObject.account === userAccount) {
																		userOfficePhone = personObject.officePhone;
																	}
																});
															}

															// push a transformed user to adUsersTransformed
															adUsersTransformed.push({
																account: userAccount,
																employeeID: adUserRaw.employeeID,
																firstName: adUserRaw.givenName,
																lastName: adUserRaw.sn,
																firstInitial: adUserRaw.givenName.slice(0, 1).toUpperCase(),
																lastInitial: adUserRaw.sn.slice(0, 1).toUpperCase(),
																displayName: adUserRaw.displayName,
																title: adUserRaw.title,
																email: adUserRaw.mail,
																officePhone: userOfficePhone,
																mobilePhone: adUserRaw.mobile,
																manager: adUserRaw.manager,
																department: adUserRaw.department,
																division: adUserRaw.division,
																securityGroups,
															});
														}
													}
												});

												// resolve this promise with a message
												resolve({
													error: false,
													csvError: false,
													activeDirectoryUsers: adUsersTransformed,
												});
												fse
													.remove(newUsersFilePathAndName)
													.then(() => {
														// console.log('FILE REMOVED');
													})
													.catch((err) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															fileRemovalError: true,
														};
														// process error
														nesoErrors.ProcessError(errorToReport);
														// reject this promise with an error
														reject(errorToReport);
													});
											})
											// if the promise is rejected with an error, 
											// 		then reject this promise with an error
											.catch((error) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													legacyPhoneNumberError: true,
												};
												// process error
												nesoErrors.ProcessError(errorToReport);
												// reject this promise with an error
												reject(errorToReport);
											});
									});
							})
							.catch((err) => {
								// construct a custom error
								const errorToReport = {
									error: true,
									fileCopyError: true,
								};
								// process error
								nesoErrors.ProcessError(errorToReport);
								// reject this promise with an error
								reject(errorToReport);
							});
						// if there was an error
					} catch (exception) {
						// console.log(exception);
						// construct a custom error
						const errorToReport = {
							error: true,
							csvError: true,
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with an error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),


	ReturnAllADUsersByDivisionDepartmentFromCSV: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get all ad users from csv
			module.exports.ReturnAllADUsersFromCSVWithLegacyPhoneNumbers()
				// if the promise to get all ad users from csv was resolved with the ad users
				.then((returnAllActiveDirectoryUsersFromCSVResult) => {
					// extract the data from the result
					const adUsers = returnAllActiveDirectoryUsersFromCSVResult.activeDirectoryUsers;
					// set up empty object to receive the new data
					const adUsersByDivisionDepartment = {};
					// iterate over adUsers
					adUsers.forEach((adUser, adUserIndex) => {
						// if this user has a division and department
						// 		(ReturnAllADUsersFromCSVWithLegacyPhoneNumbers() 
						// 		will not return anyone without an account)
						if (adUser.division && adUser.division !== '' && 
							adUser.department && adUser.department !== '') {
							// get copies of the division and department names without 
							// 		characters that are illegal as MongoDB key names
							const adUserDivision = nesoUtilities.ReplaceAll('\\.', '', adUser.division);
							// console.log(adUserDivision);
							const adUserDepartment = nesoUtilities.ReplaceAll('\\.', '', adUser.department);
							// if this user's division is not already in adUsersByDivisionDepartment
							if (typeof (adUsersByDivisionDepartment[adUserDivision]) === 'undefined') {
								// add it as an empty object
								adUsersByDivisionDepartment[adUserDivision] = {};
							}
							// if this user's department is not already in adUsersByDivisionDepartment
							if (typeof (adUsersByDivisionDepartment[adUserDivision][adUserDepartment]) === 'undefined') {
								// add it as an empty object
								adUsersByDivisionDepartment[adUserDivision][adUserDepartment] = {};
								// and add the empty "managers" array to the department
								adUsersByDivisionDepartment[adUserDivision][adUserDepartment].managers = [];
								// and add the empty "members" array to the department
								adUsersByDivisionDepartment[adUserDivision][adUserDepartment].members = [];
							}
							// add this user to the department
							adUsersByDivisionDepartment[adUserDivision][adUserDepartment]
								.members.push(adUser);
							// determine whether or not this user's manager 
							// 		is already in adUsersByDivisionDepartment
							// if this user's manager exists
							if (adUser.manager && adUser.manager !== '') {
								// set up flag indicating that manager is not already added
								let thisManagerAlreadyAdded = false;
								// iterate over managers already added
								adUsersByDivisionDepartment[adUserDivision][adUserDepartment].managers
									.forEach((manager, managerIndex) => {
										// if this already added manager is the user's manager
										if (manager === adUser.manager) {
											// set flag to indicate that this user's manager was already added
											thisManagerAlreadyAdded = true;
										}
									});
								// if this user's manager is not already added to adUsersByDivisionDepartment
								if (!thisManagerAlreadyAdded) {
									// add this user's manager's account to adUsersByDivisionDepartment
									adUsersByDivisionDepartment[adUserDivision][adUserDepartment]
										.managers.push(adUser.manager);
								}
							}
						}
					});
					// get an array of adUsersByDivisionDepartment's property keys
					const adDivisionKeys = Object.keys(adUsersByDivisionDepartment);
					// set up vars for tracking whether or not all divisions have been processed
					const adDivisionsQuantity = adDivisionKeys.length;
					let adDivisionsProcessedQuantity = 0;
					// effectively, convert department managers from accounts to profiles
					// iterate over the array of adUsersByDivisionDepartment's property keys
					adDivisionKeys.forEach((adDivisionKey) => {
						// increment the number of divisions processed
						adDivisionsProcessedQuantity += 1;
						// get an array of this division's property keys
						const adDepartmentKeys = Object.keys(adUsersByDivisionDepartment[adDivisionKey]);
						// set up vars for tracking whether or not all departments have been processed
						const adDepartmentsQuantity = adDepartmentKeys.length;
						let adDepartmentsProcessedQuantity = 0;
						// iterate over the array of this division object's property keys; 
						// 		these are departments
						adDepartmentKeys.forEach((adDepartmentKey) => {
							// increment the number of departments processed
							adDepartmentsProcessedQuantity += 1;
							// extract a copt of the managers array
							const thisDeptManagerAccounts =
								adUsersByDivisionDepartment[adDivisionKey][adDepartmentKey].managers;
							// delete the managers array
							delete adUsersByDivisionDepartment[adDivisionKey][adDepartmentKey].managers;
							// set up vars for tracking whether or not all departments have been processed
							const thisDeptManagerAccountsQuantity = thisDeptManagerAccounts.length;
							let thisDeptManagerAccountsProcessedQuantity = 0;
							// for each manager account
							thisDeptManagerAccounts.forEach((managerAccount) => {
								// try to look up the corresponding user profile
								nesoDBConnection.get('adUsers').findOne({ account: managerAccount }, {}, (error, doc) => {
									// if there was an error
									if (error || !doc) {
										// log but don't add to the new managers array
										// console.log('error');
										// console.log(error);
										// console.log('doc');
										// console.log(doc);
									} else {
										// if this department doesn't already have a managers array
										if (!adUsersByDivisionDepartment[adDivisionKey][adDepartmentKey].managers) {
											// create a new, empty managers array
											adUsersByDivisionDepartment[adDivisionKey][adDepartmentKey].managers = [];
										}
										// add the returned user profile to the new manager array
										adUsersByDivisionDepartment[adDivisionKey][adDepartmentKey]
											.managers.push(doc);
									}
									// increment the number of this department's manager accounts
									// 		that have been processed
									thisDeptManagerAccountsProcessedQuantity += 1;
									// if we're through processing all manager for all departments 
									// 		for all divisions
									if (
										(adDivisionsQuantity === adDivisionsProcessedQuantity) &&
										(adDepartmentsQuantity === adDepartmentsProcessedQuantity) &&
										(thisDeptManagerAccountsQuantity === thisDeptManagerAccountsProcessedQuantity)
									) {
										// resolve this promise with a message and the data
										resolve({
											error: false,
											csvError: false,
											adUsersByDivisionDepartment,
										});
									}
								});
							});
						});
					});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((returnAllActiveDirectoryUsersFromCSVError) => {
					// reject this promise with the error
					reject(returnAllActiveDirectoryUsersFromCSVError);
				});
		}),

	ReturnAllADDepartmentsFromADUsersByDivisionDepartment: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get all ad users by division and department from the database
			module.exports.ReturnAllUsersByDivisionDepartment()
				// if the promise to get all ad users by division and department from the database 
				// 		was resolved with the data
				.then((returnADUsersByDivisionDepartmentDataResult) => {
					// extract the data from the result
					const adUsersByDivDept = 
						returnADUsersByDivisionDepartmentDataResult.adUsersByDivisionDepartment[0];
					// set up empty object to receive the new data
					// const adDepartments = {};
					const adDepartments = {
						departments: [],
					};
					// iterate over the array of adUsersByDivDept's property keys
					Object.keys(adUsersByDivDept).forEach((adDivisionKey) => {
						// if this property key is not for the '_id' property
						if (adDivisionKey !== '_id') {
							// iterate over the array of this division object's property keys; 
							// 		these happen to be department names
							Object.keys(adUsersByDivDept[adDivisionKey]).forEach((departmentKey) => {
								adDepartments.departments.push(departmentKey);
							});
						}
					});

					// TO DO - DELETE BELOW HARD-CODING OF DEPARTMENTS ONCE ALGO HAS BETTER DATA TO CRUNCH

					adDepartments.departments.push('Courses');
					adDepartments.departments.push('Community Initiatives');
					adDepartments.departments.push('Relation Development');
					adDepartments.departments.push('Direct Charged Grant Admin');
					adDepartments.departments.push('Exhibit Innovation Projects');
					adDepartments.departments.push('Education Technology');

					// TO DO - DELETE ABOVE HARD-CODING OF DEPARTMENTS ONCE ALGO HAS BETTER DATA TO CRUNCH

					// alphabetize the departments
					adDepartments.departments.sort();
					// resolve this promise with a message and the data
					resolve({
						error: false,
						csvError: false,
						adDepartments,
					});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((returnADUsersByDivisionDepartmentDataError) => {
					// reject this promise with the error
					reject(returnADUsersByDivisionDepartmentDataError);
				});
		}),

	ReturnAllADManagersSimpleFromADUsersByDivisionDepartment: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get all ad users by division and department from the database
			module.exports.ReturnAllUsersByDivisionDepartment()
				// if the promise to get all ad users by division and department from the database 
				// 		was resolved with the data
				.then((returnADUsersByDivisionDepartmentDataResult) => {
					// extract the data from the result
					const adUsersByDivDept =
						returnADUsersByDivisionDepartmentDataResult.adUsersByDivisionDepartment[0];
					// set up empty array to receive the new data
					const adManagers = [];
					// iterate over the array of adUsersByDivDept's property keys
					Object.keys(adUsersByDivDept).forEach((adDivisionKey) => {
						// if this property key is not for the '_id' property
						if (adDivisionKey !== '_id') {
							// iterate over the array of this division object's property keys; 
							// 		these happen to be department names
							Object.keys(adUsersByDivDept[adDivisionKey]).forEach((departmentKey) => {
								// if this department has managers
								if (adUsersByDivDept[adDivisionKey][departmentKey].managers) {
									adUsersByDivDept[adDivisionKey][departmentKey].managers
										.forEach((managerProfile) => {
											let thisManagerAlreadyAdded = false;
											adManagers.forEach((addedManagerProfile) => {
												if (
													managerProfile && managerProfile.account ===
													addedManagerProfile.account
												) {
													thisManagerAlreadyAdded = true;
												}
											});
											if (!thisManagerAlreadyAdded) {
												adManagers.push(managerProfile);
											}
										});
								}
							});
						}
					});
					// alphabetize the managers
					adManagers.sort(module.exports.ReturnUserNameWeightRelativeToAnother);
					// resolve this promise with a message and the data
					resolve({
						error: false,
						mongoDBError: false,
						adManagers,
					});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((returnADUsersByDivisionDepartmentDataError) => {
					// reject this promise with the error
					reject(returnADUsersByDivisionDepartmentDataError);
				});
		}),

	ReturnAllADManagersWithFullFlatDownlinesFromDBQueries: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to retrieve users as division and department hierarchy object
			// 		and as a flat array
			Promise.all([
				module.exports.ReturnAllUsersByDivisionDepartment(),
				module.exports.ReturnAllUsers(),
			])
				// when all promises have resolved
				.then((adUsersResults) => {
					// extract results for convenience
					const adUsersByDivDept = adUsersResults[0].adUsersByDivisionDepartment[0];
					const adUsers = adUsersResults[1].docs;
					// set up empty array to receive the final data
					const adManagers = [];
					// iterate over the array of adUsersByDivDept's property keys
					Object.keys(adUsersByDivDept).forEach((adDivisionKey) => {
						// if this property key is not for the '_id' property
						if (adDivisionKey !== '_id') {
							// iterate over the array of this division object's property keys; 
							// 		these happen to be department names
							Object.keys(adUsersByDivDept[adDivisionKey]).forEach((departmentKey) => {
								// if this department has managers
								if (adUsersByDivDept[adDivisionKey][departmentKey].managers) {
									// for each manager in this department
									adUsersByDivDept[adDivisionKey][departmentKey].managers
										.forEach((managerProfile) => {
											// set flag indicating that this manager hasn't
											// 		already beed added to the final data
											let thisManagerAlreadyAdded = false;
											// iterate over managers already added to the final data
											adManagers.forEach((addedManagerProfile) => {
												// if this already-added manager is the same as 
												// 		this department's manager
												if (
													managerProfile && managerProfile.account ===
													addedManagerProfile.account
												) {
													// modify flag to indicate that 
													// 		this department's manager was 
													// already added
													thisManagerAlreadyAdded = true;
												}
											});
											// if this manager hasn't already been added
											if (!thisManagerAlreadyAdded) {
												// set up vars:
												// empty array to receive everyone 
												// 		who reports to this manager
												const downline = [];
												// array of users for whom to look up reportees
												const lookupsToBeProcessed = [managerProfile.account];
												// array of users for whom we've already 
												// 		looked up reportees
												const lookupsProcessed = [];
												// while there is a difference in 
												// 		lookups to be processed and 
												// 		those already processed
												while (lookupsToBeProcessed.length !== lookupsProcessed.length) {
													// for each users for whom we should look up reportees
													// eslint-disable-next-line no-loop-func
													lookupsToBeProcessed.forEach((lookupToProcess) => {
														// if we haven't already processed this lookup
														if (lookupsProcessed.indexOf(lookupToProcess) === -1) {
															// for each user in the flat list of users
															adUsers.forEach((adUser) => {
																// if this user reports to this manager
																if (adUser.manager === lookupToProcess) {
																	// add this user to downline
																	downline.push(adUser);
																	// add this user to lookupsToBeProcessed, 
																	// 		so that we'll also look up 
																	// 		reportees for this user
																	lookupsToBeProcessed.push(adUser.account);
																}
															});
															// whether or not any reportees were 
															// 		found, signify that we performed 
															// 		the lookup for this manager
															lookupsProcessed.push(lookupToProcess);
														}
													});
												}
												// make a copy of manager function param
												const manager = managerProfile;
												// alphabetize the downline
												downline.sort(module.exports.ReturnUserNameWeightRelativeToAnother);
												// add downline to this manager
												manager.downline = downline;
												// push this manager to the final data
												adManagers.push(manager);
											}
										});
								}
							});
						}
					});
					// alphabetize the managers
					adManagers.sort(module.exports.ReturnUserNameWeightRelativeToAnother);
					// resolve this promise with a message and the data
					resolve({
						error: false,
						mongoDBError: false,
						adManagers,
					});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((returnADUsersByDivisionDepartmentDataError) => {
					// reject this promise with the error
					reject(returnADUsersByDivisionDepartmentDataError);
				});
		}),

	ReturnAllADManagersWithFullHierarchicalDownlinesFromDBQueries: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to retrieve users as division and department hierarchy object
			// 		and as a flat array
			Promise.all([
				module.exports.ReturnAllUsersByDivisionDepartment(),
				module.exports.ReturnAllUsers(),
			])
				// when all promises have resolved
				.then((adUsersResults) => {
					// extract results for convenience
					const adUsersByDivDept = adUsersResults[0].adUsersByDivisionDepartment[0];
					const adUsers = adUsersResults[1].docs;
					// set up empty array to receive the final data
					const adManagers = [];
					// iterate over the array of adUsersByDivDept's property keys
					Object.keys(adUsersByDivDept).forEach((adDivisionKey) => {
						// if this property key is not for the '_id' property
						if (adDivisionKey !== '_id') {
							// iterate over the array of this division object's property keys; 
							// 		these happen to be department names
							Object.keys(adUsersByDivDept[adDivisionKey]).forEach((departmentKey) => {
								// if this department has managers
								if (adUsersByDivDept[adDivisionKey][departmentKey].managers) {
									// for each manager in this department
									adUsersByDivDept[adDivisionKey][departmentKey].managers
										.forEach((managerProfile) => {
											// set flag indicating that this manager hasn't
											// 		already beed added to the final data
											let thisManagerAlreadyAdded = false;
											// iterate over managers already added to the final data
											adManagers.forEach((addedManagerProfile) => {
												// if this already-added manager is the same as 
												// 		this department's manager
												if (
													managerProfile && managerProfile.account ===
													addedManagerProfile.account
												) {
													// modify flag to indicate that 
													// 		this department's manager was 
													// already added
													thisManagerAlreadyAdded = true;
												}
											});
											// if this manager hasn't already been added
											if (!thisManagerAlreadyAdded) {
												// set up vars:
												// empty object to receive everyone 
												// 		who reports to this manager, 
												// 		structured by divisions and departments
												const downline = {};
												// array of users for whom to look up reportees
												const lookupsToBeProcessed = [managerProfile.account];
												// array of users for whom we've already 
												// 		looked up reportees
												const lookupsProcessed = [];
												// while there is a difference in 
												// 		lookups to be processed and 
												// 		those already processed
												while (lookupsToBeProcessed.length !== lookupsProcessed.length) {
													// for each users for whom we should look up reportees
													// eslint-disable-next-line no-loop-func
													lookupsToBeProcessed.forEach((lookupToProcess) => {
														// if we haven't already processed this lookup
														if (lookupsProcessed.indexOf(lookupToProcess) === -1) {
															// for each user in the flat list of users
															adUsers.forEach((adUser) => {
																// if this user reports to this manager
																if (adUser.manager === lookupToProcess) {
																	// get copies of the division and department names without 
																	// 		characters that are illegal as MongoDB key names
																	const adUserDivision = nesoUtilities.ReplaceAll('\\.', '', adUser.division);
																	// console.log(adUserDivision);
																	const adUserDepartment = nesoUtilities.ReplaceAll('\\.', '', adUser.department);
																	// if this user's division is not already in downline
																	if (typeof (downline[adUserDivision]) === 'undefined') {
																		// add it as an empty object
																		downline[adUserDivision] = {};
																	}
																	// if this user's department is not already in downline
																	if (typeof (downline[adUserDivision][adUserDepartment]) === 'undefined') {
																		// add it as an empty array
																		downline[adUserDivision][adUserDepartment] = [];
																	}
																	// add this user to the department in downline
																	downline[adUserDivision][adUserDepartment]
																		.push(adUser);
																	// add this user to lookupsToBeProcessed, 
																	// 		so that we'll also look up 
																	// 		reportees for this user
																	lookupsToBeProcessed.push(adUser.account);
																}
															});
															// whether or not any reportees were 
															// 		found, signify that we performed 
															// 		the lookup for this manager
															lookupsProcessed.push(lookupToProcess);
														}
													});
												}
												// make a copy of manager function param
												const manager = managerProfile;
												// alphabetize the downline arrays:
												// iterate over the division keys
												Object.keys(downline).forEach((downlineDivisionKey) => {
													// iterate over the department keys
													Object.keys(downline[downlineDivisionKey])
														.forEach((downlineDepartmentKey) => {
															// alphabetize array
															downline[downlineDivisionKey][downlineDepartmentKey]
																.sort(module.exports.ReturnUserNameWeightRelativeToAnother);
														});
												});
												// add downline to this manager
												manager.downline = downline;
												// push this manager to the final data
												adManagers.push(manager);
											}
										});
								}
							});
						}
					});
					// alphabetize the managers
					adManagers.sort(module.exports.ReturnUserNameWeightRelativeToAnother);
					// resolve this promise with a message and the data
					resolve({
						error: false,
						mongoDBError: false,
						adManagers,
					});
				})
				// if the promise to get all ad users from csv was rejected with an error
				.catch((returnADUsersByDivisionDepartmentDataError) => {
					// reject this promise with the error
					reject(returnADUsersByDivisionDepartmentDataError);
				});
		}),

	// DATA PULLS

	// user
	ReturnAllUsers: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adUsers')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// user
	ReturnOneUser: account =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve one specified document from the adUsers document collection
			// eslint-disable-next-line object-shorthand
			nesoDBQueries.ReturnOneSpecifiedDocFromCollection('adUsers', {
				$and: [{
					account,
				}],
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// divisions, departments, users
	ReturnAllUsersByDivisionDepartment: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adUsersByDivisionDepartment')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						adUsersByDivisionDepartment: result.docs,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllUsersInDepartment: deptName =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('adUsers', {
				department: deptName,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	ReturnAllUsersInDivision: divName =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('adUsers', {
				division: divName,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// departments
	ReturnAllDepartments: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adDepartments')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// managers
	ReturnAllADManagersFlat: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adManagersFlat document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adManagersFlat')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					// TO DO - DELETE BELOW HARD-CODING OF MANAGERS ONCE ALGO HAS BETTER DATA TO CRUNCH

					const hardCodedManagers = [
						{
							_id: '5c1ab151c3ee4111b4d5269e',
							account: 'wtatarouns',
							employeeID: '10726',
							firstName: 'Wendy',
							lastName: 'Tatarouns',
							firstInitial: 'W',
							lastInitial: 'T',
							displayName: 'Wendy Tatarouns',
							title: 'Assistant Manager, Visitor Services',
							email: 'wtatarouns@mos.org',
							officePhone: '617-589-0213',
							mobilePhone: '617-275-3166',
							manager: 'ahile',
							department: 'Visitor Services',
							division: 'Visitor Experience & Operations',
							securityGroups: [
								'Tessitura Training',
								'VS Closing',
								'Redboard_viewers',
								'VS_Mgmt',
								'VS_Training',
								'mos.org',
								'SaleWizard Maintenance Users',
								'TrackIT Users',
								'LSI_Admits',
								'DSS Audio Tour Inventory',
								'Visitor Services',
								'BoxOffice - Less Restricted Users',
								'Kiosk Access',
								'Box Office FAQs',
								'CSI Project Team',
								'MOSAccess Admin Users',
								'VS_MembershipSales',
								'SP_Staff',
								"Box Office FAQ - Don''t Use_See Pierre",
								'Tessitura Ticketing',
								'MaxFlight',
								'Box Office FAQs Modify',
								'PA System Project',
								'Lockers',
								'SP_Dept_Write_Volunteer_Supervisors',
								'BOI',
								'WWV',
								'WiFi Access',
								'Lobby Training',
								'Shift-Leaders',
								'SP_Dept_HR_ManagersHandbook',
								'Digital Signage',
								'Crystal Enterprise',
								'SP_Team_Write_Safety',
								'VS_SW',
								'4D Theater Operations',
								'VS_PassDonation',
								'GSW Scripts and Slides',
								'VS_Staff',
								'Box Office Admin',
								'PompeiiOps',
								'Admits',
							],
						}, {
							_id: '5c38bd819e68540958b2816d',
							account: 'jpeeler',
							employeeID: '14861',
							firstName: 'Jackie',
							lastName: 'Peeler',
							firstInitial: 'J',
							lastInitial: 'P',
							displayName: 'Jackie Peeler',
							title: 'Manager, Living Collections',
							email: 'jpeeler@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: 'bharvey',
							department: 'Living Collections',
							division: 'Education',
							securityGroups: ['mos.org', 'SP_Staff', 'Butterfly Garden', 'OS X Users', 'Web VPN Access', 'Living Collections', 'WiFi Access'],
						}, {
							_id: '5d836dc075997e1268d32c4e',
							account: 'jmarkow',
							employeeID: '',
							firstName: 'Joanne',
							lastName: 'Markow',
							firstInitial: 'J',
							lastInitial: 'M',
							displayName: 'Joanne Markow',
							title: 'Director, Curriculum Marketing',
							email: 'jmarkow@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: 'hgunsallus',
							department: 'Curriculum Marketing',
							division: '',
							securityGroups: ['mos.org', 'EIE - Aspen', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'PGP_BASIC'],
						}, {
							_id: '5e26f5d14d169d1058cf18a5',
							account: 'pippolito',
							employeeID: '011704',
							firstName: 'Paul',
							lastName: 'Ippolito',
							firstInitial: 'P',
							lastInitial: 'I',
							displayName: 'Paul Ippolito',
							title: 'Associate Vice President, Facilities',
							email: 'pippolito@mos.org',
							officePhone: '617-589-0154',
							mobilePhone: '617-733-1684',
							manager: 'jburke',
							department: 'Facilities',
							division: 'Visitor Experience & Ops',
							securityGroups: ['BWVisitorExp', 'COI other', 'Budget_VisitorServices', 'mos.org', 'Exhibits_Projects_Mos_Then_And_Now', 'TrackIT Users', 'BPT', 'Facilities group', 'SN Facilities Managers', 'Master Planning', 'GWRenovation', 'BWPhysicalExp', 'Wayfinder', 'SP_Staff', 'Facilities Admin', 'FinanceSSRSUsers', 'Unicco_Grp', 'Butterfly Garden', 'Web VPN Access', 'Facility_Users', 'SN Facilities Technicians', 'MMTfolder', 'BWCoreTeam', 'ProjectManagers', 'GreenTeam', 'WiFi Access', 'PGP_BASIC', 'Power Users', 'Facilities-Exhibit Projects', 'SP_Dept_HR_ManagersHandbook', 'SP_Team_Write_Safety_Ldrs', 'Safety Leadership', 'Emergency Management Plan', 'Budget_RestrictedAccess', 'Accessibility_Shared', 'Crystal Enterprise', 'SP_Team_Write_Safety', 'Safety_Zeus', 'space', 'TrackIT Technicians', 'AnyConnect VPN Access', 'BPT - Aspen'],
						}, {
							_id: '5c41f8005ff3860d546c0d47',
							account: 'gmurray',
							employeeID: '006207',
							firstName: 'Greg',
							lastName: 'Murray',
							firstInitial: 'G',
							lastInitial: 'M',
							displayName: 'Greg Murray',
							title: 'Manager, Technical Design and Production',
							email: 'gmurray@mos.org',
							officePhone: '617-589-4256',
							mobilePhone: '',
							manager: 'mhorvath',
							department: 'Technical Design & Production',
							division: 'Education',
							securityGroups: ['COI other', 'CS&amp;T', 'Exhibits_Projects_Random', 'mos.org', 'TrackIT Users', 'Exhibits_Projects_Engineering_2016', 'LeafcutterAnts', 'Current Science &amp; Technology', 'Exhibit Leadership', 'Exhibits_Projects_Tech_and_You', 'SP_Staff', 'Exhibits_Projects_MercuryToMars', 'FinanceSSRSUsers', 'Ship Cases', 'OS X Users', 'Exhibits_Projects_New_Exhibition', 'Budget_Education', 'MMTfolder', 'Exhibits_Titan', 'Live Presentations', 'BWExhibitsPlanningTeam', 'WiFi Access', 'ExhibitsData', 'Outreach', 'ShowControl', 'PGP_BASIC', 'PO and Invoice records', 'Budget_Exhibits', 'Budget_RestrictedAccess', 'Crystal Enterprise', 'SP_Team_Write_Safety', 'Schedules', 'TOE Component', 'Safety_Zeus'],
						}, {
							_id: '5c5b20a1476e8b1078bd9fff',
							account: 'dmacdonald',
							employeeID: '005431',
							firstName: 'Dan',
							lastName: 'MacDonald',
							firstInitial: 'D',
							lastInitial: 'M',
							displayName: 'Dan MacDonald',
							title: 'Exhibit Maintenance Manager',
							email: 'dmacdonald@mos.org',
							officePhone: '617-589-0161',
							mobilePhone: '617-851-8813',
							manager: 'bharvey',
							department: 'Exhibit Maintenance',
							division: 'Education',
							securityGroups: ['Exhibits_Projects_What_Is_Technology', 'Exhibits Operations', 'Exhibits Maintenance', 'COI other', 'Swat team', 'Exhibits_Projects_Random', 'mos.org', 'Exhibits_Projects_Mos_Then_And_Now', 'TrackIT Users', 'Exhibits_Projects_Pixar', 'SP_Team_Write_HHL_Maintenance', 'Audio Visual', 'GWRenovation', 'Exhibit Leadership', 'SP_Staff', 'SN Exhibit Managers', 'FinanceSSRSUsers', 'Butterfly Garden', 'OS X Users', 'Web VPN Access', 'PA System Project', 'Mapping', 'Budget_Education', 'PlatinumUsers', 'Exhibits_Projects_Escher', 'MMTfolder', 'Exhibit Admin Group', 'ProjectManagers', 'Showcase', 'VFT', 'SP_Team_write_exhibitmaintenance', 'Exhibits Projects', 'WiFi Access', 'JanusUsers', 'PGP_BASIC', 'PO and Invoice records', 'Exhibits', 'Making Models', 'SP_Dept_HR_ManagersHandbook', 'Budget_Exhibits', 'Budget_RestrictedAccess', 'Crystal Enterprise', 'SP_Team_Write_Safety', 'Charles River Gallery', 'Exhibits Development', 'GSW Scripts and Slides', 'Safety_Zeus', 'Tech Showcase', 'PompeiiOps', 'TrackIT Technicians', 'AnyConnect VPN Access'],
						}, {
							_id: '5d8cd271b07f56116cb2828d',
							account: 'madams',
							employeeID: '10385',
							firstName: 'Mike',
							lastName: 'Adams',
							firstInitial: 'M',
							lastInitial: 'A',
							displayName: 'Mike Adams',
							title: 'Manager, Traveling Programs',
							email: 'madams@mos.org',
							officePhone: '617-589-4253',
							mobilePhone: '',
							manager: 'shorrigan',
							department: 'Traveling Programs',
							division: 'Education',
							securityGroups: ['SP_Team_Write_EEP', 'mos.org', 'TrackIT Users', 'Traveling Programs', 'Budget_EdPrograms', 'SP_Staff', 'FinanceSSRSUsers', 'Traveling Programs admin', 'Budget_Education', 'MMTfolder', 'WiFi Access', 'Outreach', 'PGP_BASIC', 'Community Outreach', 'Tessitura Education', 'SP_Dept_HR_ManagersHandbook', 'Budget_RestrictedAccess', 'Crystal Enterprise', 'SP_Team_Write_Safety', 'EEP', 'GSW Scripts and Slides', 'Safety_Zeus', 'BWEducationExp'],
						}, {
							_id: '5d8cd271b07f56116cb2836d',
							account: 'tfarrand',
							employeeID: '14710',
							firstName: 'Tony',
							lastName: 'Farrand',
							firstInitial: 'T',
							lastInitial: 'F',
							displayName: 'Tony Farrand',
							title: 'Manager of System Support Services',
							email: 'tfarrand@mos.org',
							officePhone: '617-589-0493',
							mobilePhone: '',
							manager: 'psheppard',
							department: 'IIT- Infrastructure',
							division: 'Finance & Systems Services',
							securityGroups: ['Budget_Finance', 'PGP_ADMIN', 'mos.org', 'DameWare Admins', 'IITProd', 'SP_Dept_Write_IIT', 'Tessitura Administration', 'SP_Team_Write_IIT', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'IIT group', 'MMTfolder', 'aqmsalerts', 'WiFi Access', 'Office 365 Admins', 'Budget_RestrictedAccess', 'SN IT Service Desk', 'AnyConnect VPN Access'],
						}, {
							_id: '5c644d1075180509bc07afc5',
							account: 'rstaley',
							employeeID: '14450',
							firstName: 'Robin',
							lastName: 'Staley',
							firstInitial: 'R',
							lastInitial: 'S',
							displayName: 'Robin Staley',
							title: 'Director, Curriculum Marketing',
							email: 'rstaley@mos.org',
							officePhone: '617-589-0251',
							mobilePhone: '',
							manager: 'tsperry',
							department: 'Curriculum Marketing',
							division: 'Marketing & External Affairs',
							securityGroups: ['Budget_Marketing', 'mos.org', 'EiE Senior Leadership', 'EIE - Aspen', 'EiE Mulltimedia', 'SP_Staff', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'EiE IRB Approved', 'Budget_RestrictedAccess', 'Marketing', 'EiE Product Strategy', 'AnyConnect VPN Access'],
						}, {
							_id: '5c65aca14b1ca10e00ded91b',
							account: 'jpolasek',
							employeeID: '14445',
							firstName: 'Jason',
							lastName: 'Polasek',
							firstInitial: 'J',
							lastInitial: 'P',
							displayName: 'Jason Polasek',
							title: 'Director, Donor Relations',
							email: 'jpolasek@mos.org',
							officePhone: '617-589-0301',
							mobilePhone: '',
							manager: 'abuzay',
							department: 'Donor Relations',
							division: 'Advancement',
							securityGroups: ['Budget_Advancement', 'Membership - Aspen', 'mos.org', 'TrackIT Users', 'AdvancementData', 'LSI_Admits', 'Tessitura Advancement', 'Development', 'Special Events', 'SP_Staff', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'MMTfolder', 'Endowment', 'Advancement Communications', 'Membership_Staff', 'WiFi Access', 'Budget_RestrictedAccess', 'Crystal Enterprise', 'AnyConnect VPN Access'],
						}, {
							_id: '5c6ff250dbde9f0980ba90c1',
							account: 'abuzay',
							employeeID: '14592',
							firstName: 'Aaron',
							lastName: 'Buzay',
							firstInitial: 'A',
							lastInitial: 'B',
							displayName: 'Aaron Buzay',
							title: 'Associate Vice President, Advancement Operations',
							email: 'abuzay@mos.org',
							officePhone: '617-589-0181',
							mobilePhone: '978-771-3712',
							manager: 'elliestarr',
							department: 'Advancement Operations',
							division: 'Advancement',
							securityGroups: ['Data Services', 'mos.org', 'AdvancementData', 'AdvAdmin', 'Tessitura Advancement', 'Development', 'Special Events', 'Annual Fund', 'SP_Staff', 'ADV Operations', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'Budget_RestrictedAccess', 'Crystal Enterprise', 'AnyConnect VPN Access'],
						}, {
							_id: '5dcc3691ee15ad107849a5a2',
							account: 'csanantonio',
							employeeID: '013324',
							firstName: 'Chris',
							lastName: 'San Antonio-Tunis',
							firstInitial: 'C',
							lastInitial: 'S',
							displayName: 'Chris San Antonio-Tunis',
							title: 'R&E Mgr',
							email: 'csanantonio@mos.org',
							officePhone: '617-589-4228',
							mobilePhone: '',
							manager: '',
							department: 'EiE Research & Evaluation',
							division: 'Education',
							securityGroups: ['mos.org', 'EiE ReDevAll', 'TrackIT Users', 'EIE - Aspen', 'EiE Research', 'SP_Staff', 'FinanceSSRSUsers', 'EiE Video Project Dev', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'PGP_BASIC', 'EiE-e4vcs', 'AnyConnect VPN Access'],
						}, {
							_id: '5c6ff250dbde9f0980ba921b',
							account: 'jolson',
							employeeID: '14704',
							firstName: 'Jill',
							lastName: 'Olson',
							firstInitial: 'J',
							lastInitial: 'O',
							displayName: 'Jill Olson',
							title: 'Associate Director of Customer Success',
							email: 'jolson@mos.org',
							officePhone: '617-589-0399',
							mobilePhone: '508-265-3081',
							manager: 'hgunsallus',
							department: 'EiE Business Operations & Sales',
							division: 'Education',
							securityGroups: ['mos.org', 'EIE - Aspen', 'EiE Implementation', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'Education', 'WiFi Access', 'EiE Salesforce Backup', 'EiE Product Strategy', 'AnyConnect VPN Access'],
						}, {
							_id: '5cfa51c08c480410607b7e19',
							account: 'arussell',
							employeeID: '14523',
							firstName: 'Andrew',
							lastName: 'Russell',
							firstInitial: 'A',
							lastInitial: 'R',
							displayName: 'Andrew Russell',
							title: 'Senior Director, Corporate Foundation & Government Relations',
							email: 'arussell@mos.org',
							officePhone: '617-589-0142',
							mobilePhone: '',
							manager: 'elliestarr',
							department: "Corporate/Found./Gov't Relations",
							division: 'Advancement',
							securityGroups: ['Budget_Advancement', 'mos.org', 'AdvancementData', 'Tessitura Advancement', 'Development', 'SP_Staff', 'ADV Operations', 'FinanceSSRSUsers', 'OS X Users', 'EiE Museum', 'Web VPN Access', 'MMTfolder', 'WiFi Access', 'Budget_RestrictedAccess', 'AnyConnect VPN Access'],
						}, {
							_id: '5cf83b60af3264101464dae9',
							account: 'hgunsallus',
							employeeID: '14677',
							firstName: 'Heather',
							lastName: 'Gunsallus',
							firstInitial: 'H',
							lastInitial: 'G',
							displayName: 'Heather Gunsallus',
							title: 'Executive Director of Curriculum Sales',
							email: 'hgunsallus@mos.org',
							officePhone: '617-589-0116',
							mobilePhone: '443-474-2476',
							manager: 'asawyer',
							department: 'EiE Business Operations & Sales',
							division: 'Education',
							securityGroups: ['EiE PTF', 'mos.org', 'QuarkLogin', 'EIE - Aspen', 'Budget_EdPrograms', 'EiE Implementation', 'SP_Staff', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'Budget_Education', 'WiFi Access', 'Budget_RestrictedAccess', 'Budget_EiE', 'EiE Salesforce Backup', 'EiE Product Strategy', 'AnyConnect VPN Access'],
						}, {
							_id: '5d056a6199403d13d8e23121',
							account: 'spokress',
							employeeID: '14680',
							firstName: 'Shay',
							lastName: 'Pokress',
							firstInitial: 'S',
							lastInitial: 'P',
							displayName: 'Shay Pokress',
							title: 'Director, Computer Science Education',
							email: 'spokress@mos.org',
							officePhone: '617-589-4238',
							mobilePhone: '-',
							manager: 'asawyer',
							department: 'Computer Science Education',
							division: 'Education',
							securityGroups: ['EiE PTF', 'mos.org', 'EIE - Aspen', 'Budget_EdPrograms', 'SP_Staff', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'Budget_Education', 'WiFi Access', 'Budget_RestrictedAccess', 'EiE Product Strategy', 'CSEI', 'AnyConnect VPN Access'],
						}, {
							_id: '5c826750eb4f380d84045917',
							account: 'dsittenfeld',
							employeeID: '007723',
							firstName: 'David',
							lastName: 'Sittenfeld',
							firstInitial: 'D',
							lastInitial: 'S',
							displayName: 'David Sittenfeld',
							title: 'Program Manager, Forum',
							email: 'dsittenfeld@mos.org',
							officePhone: '617-589-4258',
							mobilePhone: '',
							manager: 'asawyer',
							department: 'Forum',
							division: 'Education',
							securityGroups: ['Race Education Team', 'CPM', 'CS&amp;T', 'mos.org', 'TrackIT Users', 'Chem Attitudes', 'Budget_EdPrograms', 'Forum_Grp', 'Exhibits Creative Project Management', 'SP_Staff', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'Budget_Education', 'Chem Attitudes Finance', 'Live Presentations', 'Showcase', 'Education', 'WiFi Access', 'Outreach', 'PGP_BASIC', 'Programs', 'Exhibits', 'Budget_RestrictedAccess', 'Crystal Enterprise', 'CST_Admin', 'MSPES', 'CGI_Image', 'Schedules', 'Tech Showcase'],
						}, {
							_id: '5c826750eb4f380d84045aad',
							account: 'psobel',
							employeeID: '14434',
							firstName: 'Pete',
							lastName: 'Sobel',
							firstInitial: 'P',
							lastInitial: 'S',
							displayName: 'Pete Sobel',
							title: 'Director, Partnerships and Market Development',
							email: 'psobel@mos.org',
							officePhone: '617-589-4439',
							mobilePhone: '908-400-9473',
							manager: 'tsperry',
							department: 'Partnerships & Market Development',
							division: 'Marketing & External Affairs',
							securityGroups: ['Planetarium Study', 'BWVisitorExp', 'SP_Dept_Write_Marketing_Promo', 'Budget_Marketing', 'mos.org', 'Courses group', 'Exhibits_Projects_Pixar', 'FoodCharrette', 'EIE - Aspen', 'SP_Dept_Write_Marketing', 'EiE Implementation', 'Media Relations', 'OneLogin', 'Courses and Travel', 'E-Marketing', 'HHL Communications', 'PlanetariumShowSales', 'SP_Staff', 'FinanceSSRSUsers', 'Brainy Acts', 'External Marketing', 'OS X Users', 'Courses &amp; Travel Administration', 'Web VPN Access', 'MMTfolder', 'MarCom_Dept', 'BWCoreTeam', 'SP_Team_Write_Marketing', 'Marketing Administration', 'WiFi Access', 'ExhibitsData', 'Pompeii', 'Tessitura Marketing', 'SP_Team_Write_NEST', 'SP_Dept_HR_ManagersHandbook', 'Media Production', 'Budget_RestrictedAccess', 'Charles River Gallery', 'Media Relations Group', 'Marketing', 'EiE Product Strategy', 'AnyConnect VPN Access'],
						}, {
							_id: '5c826750eb4f380d84045aaf',
							account: 'pwong',
							employeeID: '10257',
							firstName: 'Peter',
							lastName: 'Wong',
							firstInitial: 'P',
							lastInitial: 'W',
							displayName: 'Peter Wong',
							title: 'Director, Food STEM Initiative',
							email: 'pwong@mos.org',
							officePhone: '617-589-0220',
							mobilePhone: '',
							manager: 'imiaoulis',
							department: 'Directors Office',
							division: 'Museumwide Administration',
							securityGroups: ['mos.org', 'TrackIT Users', 'FoodCharrette', 'Gateway - Aspen', 'GPC', 'Strategic Projects', 'SP_Staff', 'SPG', 'FinanceSSRSUsers', 'OS X Users', 'Web VPN Access', 'NCTL - Aspen', 'MMTfolder', 'Middle School', 'WiFi Access', 'Algebra By Design', 'PGP_BASIC', 'SP_Dept_HR_ManagersHandbook', 'University Relations', 'Crystal Enterprise'],
						}, {
							_id: '5c826750eb4f380d84045ae5',
							account: 'showe',
							employeeID: '004461',
							firstName: 'Stan',
							lastName: 'Howe',
							firstInitial: 'S',
							lastInitial: 'H',
							displayName: 'Stan Howe',
							title: 'Assistant Controller, Systems & Restricted Funds',
							email: 'showe@mos.org',
							officePhone: '617-589-0118',
							mobilePhone: '',
							manager: 'btherrien',
							department: 'Accounting',
							division: 'Finance & Systems Services',
							securityGroups: ['Data Services', 'CPM', 'mos.org', 'TrackIT Users', 'LSI_Admits', 'SP_Dept_Write_Finance', 'HRIS Project 2017', 'Fundware Finance Users', 'NISE', 'Mangrove', 'SP_Dept_Write_GPC_Settings', 'SP_Team_Write_HRIS_Payroll', 'GPC', 'Accounting', 'MajorPro', 'EIEgrants', 'SP_Staff', 'SPG', 'FinanceSSRSUsers', 'Budget_FullAccess', 'Web VPN Access', 'MMTfolder', 'Accounting - Zeus', 'Endowment', 'Business Services', 'WiFi Access', 'SP_Dept_Write_Finance_Attendance', 'SP_Dept_Write_GPC', 'PGP_BASIC', 'CompBudget', 'payroll finance', 'Financial Edge', 'Millennium Users', 'SP_Dept_HR_ManagersHandbook', 'IRB Documentation', 'Exhibits_Contracts', 'Accessibility_Shared', 'EE Staff', 'Controller', 'Crystal Enterprise', 'SC Purchase Orders', 'Tessitura Finance', 'PCCasheGlobal', 'NISE Finance', 'AnyConnect VPN Access'],
						}, {
							_id: '5c826750eb4f380d84045af6',
							account: 'smcduffee',
							employeeID: '14855',
							firstName: 'Sam',
							lastName: 'McDuffee',
							firstInitial: 'S',
							lastInitial: 'M',
							displayName: 'Sam McDuffee',
							title: 'Manager, Content Strategy & Social Media',
							email: 'smcduffee@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: 'prosenthal',
							department: 'Marketing',
							division: 'Marketing & External Affairs',
							securityGroups: ['mos.org', 'Media Relations', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'Media Relations Group', 'Marketing'],
						}, {
							_id: '5c826750eb4f380d84045b2a',
							account: 'vsbarra',
							employeeID: '14842',
							firstName: 'Vince',
							lastName: 'Sbarra',
							firstInitial: 'V',
							lastInitial: 'S',
							displayName: 'Vince Sbarra',
							title: 'Technology Director',
							email: 'vsbarra@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: 'hgunsallus',
							department: 'EiE Business Operations & Sales',
							division: 'Education',
							securityGroups: ['mos.org', 'Budget_EdPrograms', 'EiE Implementation', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'Budget_Education', 'WiFi Access', 'Budget_RestrictedAccess', 'AnyConnect VPN Access'],
						}, {
							_id: '5c826750eb4f380d84045b37',
							account: 'yblaise',
							employeeID: '14554',
							firstName: 'Yasmina',
							lastName: 'Blaise',
							firstInitial: 'Y',
							lastInitial: 'B',
							displayName: 'Yasmina Blaise',
							title: 'Assistant Controller, Budget & Operations',
							email: 'yblaise@mos.org',
							officePhone: '617-589-4591',
							mobilePhone: '-',
							manager: 'btherrien',
							department: 'Accounting',
							division: 'Finance & Systems Services',
							securityGroups: ['mos.org', 'Tessitura Users', 'Fundware Finance Users', 'SP_Staff', 'Budget_FullAccess', 'OS X Users', 'Web VPN Access', 'Business Services', 'WiFi Access', 'PGP_BASIC', 'CompBudget', 'payroll finance', 'Financial Edge', 'Controller', 'Tessitura Finance', 'AnyConnect VPN Access'],
						}, {
							_id: '5c9a1440a4636909d089d8ce',
							account: 'mrousselle',
							employeeID: '14765',
							firstName: 'Melissa',
							lastName: 'Rousselle',
							firstInitial: 'M',
							lastInitial: 'R',
							displayName: 'Melissa Rousselle',
							title: 'Digital Marketing Manager',
							email: 'mrousselle',
							officePhone: '617-589-0254',
							mobilePhone: '',
							manager: 'rstaley',
							department: 'Curriculum Marketing',
							division: 'Marketing & External Affairs',
							securityGroups: ['mos.org', 'EIE - Aspen', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'Marketing', 'EiE Product Strategy', 'AnyConnect VPN Access'],
						}, {
							_id: '5c9a1440a4636909d089d98a',
							account: 'vcerullo',
							employeeID: '',
							firstName: 'Vanessa',
							lastName: 'Cerullo',
							firstInitial: 'V',
							lastInitial: 'C',
							displayName: 'Vanessa Cerullo',
							title: '',
							email: 'vcerullo@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: '',
							department: '',
							division: '',
							securityGroups: ['mos.org', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'AnyConnect VPN Access'],
						}, {
							_id: '5c9a1440a4636909d089d7a9',
							account: 'gfavreau',
							employeeID: '',
							firstName: 'Gail',
							lastName: 'Favreau',
							firstInitial: 'G',
							lastInitial: 'F',
							displayName: 'Gail Favreau',
							title: '',
							email: 'gfavreau@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: '',
							department: '',
							division: '',
							securityGroups: ['mos.org', 'TrackIT Users', 'AdvancementData', 'Tessitura Advancement', 'Development', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'AnyConnect VPN Access'],
						}, {
							_id: '5cc773e1e4787e0dc42c3a40',
							account: 'rkipling',
							employeeID: '009934',
							firstName: 'Becki',
							lastName: 'Kipling',
							firstInitial: 'B',
							lastInitial: 'K',
							displayName: 'Becki Kipling',
							title: 'Manager, Early Childhood Development & Education',
							email: 'rkipling@mos.org',
							officePhone: '617-589-0429',
							mobilePhone: '',
							manager: 'tporter',
							department: 'Early Childhood Development & Education',
							division: 'Education',
							securityGroups: ['BWVisitorExp', 'Exhibits_Projects_Share', 'Living Lab Finances', 'DCTechStudio', 'mos.org', 'TrackIT Users', 'Visitor Programs', 'OnSite Research', 'Exhibits_Projects_TechGallery', 'Youth Programs', 'DC-LL Staff', 'Exhibits_Projects_Engineering_2016', 'Volsupervisors', 'National Living Lab', 'Living Laboratory - DC', 'ECEMgr', 'Exhibit Leadership', 'Exhibits_Projects_Tech_and_You', 'SP_Staff', 'FinanceSSRSUsers', 'Exhibits_Projects_ProductiveStruggle', 'OS X Users', 'Pixar Ed Programs', 'Budget_Education', 'SP_Dept_Write_Volunteer_Supervisors', 'BWCoreTeam', 'WWV', 'Discovery', 'Education', 'Exhibits_Projects_Bird_Refurb_2016', 'BWExhibitsPlanningTeam', 'WiFi Access', 'ExhibitsData', 'PGP_BASIC', 'Exhibits_Projects_ELEEE_New_Restricted', 'SP_Dept_HR_ManagersHandbook', 'IRB Documentation', 'Budget_Exhibits', 'Budget_RestrictedAccess', 'Exhibits WS', 'Crystal Enterprise', 'WWV-R &amp; VS-RW', 'Exhibits_Projects_EmotionalEntanglement', 'Exhibit Content Development', 'GSW Scripts and Slides', 'Schedules', 'NLL - Teens', 'BWEducationExp'],
						}, {
							_id: '5cc87f1126278f0438fa9b2f',
							account: 'kwright',
							employeeID: '',
							firstName: 'Katie',
							lastName: 'Wright',
							firstInitial: 'K',
							lastInitial: 'W',
							displayName: 'Katie Wright',
							title: '',
							email: 'kwright@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: '',
							department: '',
							division: '',
							securityGroups: ['mos.org', 'AdvancementData', 'Tessitura Advancement', 'Development', 'Special Events', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'AnyConnect VPN Access'],
						}, {
							_id: '5d0c01e0049d4d0130a245c0',
							account: 'lstanley',
							employeeID: '14192',
							firstName: 'Lindsay',
							lastName: 'Stanley',
							firstInitial: 'L',
							lastInitial: 'S',
							displayName: 'Lindsay Stanley',
							title: 'Manager, Annual Giving',
							email: 'lstanley@mos.org',
							officePhone: '617-589-0476',
							mobilePhone: '',
							manager: 'mgrace',
							department: 'Annual Giving',
							division: 'Advancement',
							securityGroups: ['mos.org', 'TrackIT Users', 'AdvancementData', 'LSI_Admits', 'Tessitura Advancement', 'Development', 'Annual Fund', 'SP_Staff', 'Web VPN Access', 'WiFi Access', 'Millennium Users', 'AnyConnect VPN Access'],
						}, {
							_id: '5cf6e9e1b9e82507805cf546',
							account: 'mrousselle',
							employeeID: '14765',
							firstName: 'Melissa',
							lastName: 'Rousselle',
							firstInitial: 'M',
							lastInitial: 'R',
							displayName: 'Melissa Rousselle',
							title: 'Digital Marketing Manager',
							email: 'mrousselle',
							officePhone: '617-589-0254',
							mobilePhone: '',
							manager: 'rstaley',
							department: 'Curriculum Marketing',
							division: 'Marketing & External Affairs',
							securityGroups: ['mos.org', 'Data Protection Compliance', 'EIE - Aspen', 'SP_Staff', 'OS X Users', 'Web VPN Access', 'WiFi Access', 'Marketing', 'EiE Product Strategy', 'AnyConnect VPN Access'],
						}, {
							_id: '5da873e0c73220081050599e',
							account: 'rvenegas',
							employeeID: '14810',
							firstName: 'Renee',
							lastName: 'Venegas',
							firstInitial: 'R',
							lastInitial: 'V',
							displayName: 'Renee Venegas',
							title: 'Associate Regional Sales Manager',
							email: 'rvenegas@mos.org',
							officePhone: '',
							mobilePhone: '',
							manager: 'hgunsallus',
							department: 'EiE Business Operations & Sales',
							division: 'Education',
							securityGroups: ['mos.org', 'EiE Implementation', 'SP_Staff', 'Web VPN Access', 'WiFi Access', 'AnyConnect VPN Access'],
						}, {
							_id: '5d508fe0cdcdbb0b880ca7c8',
							account: 'amelia',
							employeeID: '12741',
							firstName: 'Adrian',
							lastName: 'Melia',
							firstInitial: 'A',
							lastInitial: 'M',
							displayName: 'Adrian Melia',
							title: 'Program Manager, Informal Engineering & Computer Science Learning',
							email: 'amelia@mos.org',
							officePhone: '617-589-4246',
							mobilePhone: '',
							manager: 'lbeall',
							department: 'Informal Engineering & Computer Science Learning',
							division: 'Education',
							securityGroups: ['BWVisitorExp', 'Exhibits_Projects_TechGallery', 'Exhibits_Projects_Engineering_2016', 'Design Challenge', 'CCPlace', 'SP_Staff', 'Exhibits_Projects_MercuryToMars', 'OS X Users', 'Web VPN Access', 'Pixar Ed Programs', 'SP_Dept_Write_Volunteer_Supervisors', 'WiFi Access', 'Exhibits WS', 'Crystal Enterprise'],
						}, {
							_id: '5dfb8260708c920b2409d8c6',
							account: 'btherrien',
							employeeID: '012286',
							firstName: 'Brian',
							lastName: 'Therrien',
							firstInitial: 'B',
							lastInitial: 'T',
							displayName: 'Brian Therrien',
							title: 'AVP, Finance',
							email: 'btherrien@mos.org',
							officePhone: '617-589-0109',
							mobilePhone: '',
							manager: 'jslakey',
							department: 'Controller\'s Office',
							division: 'Finance & System Services',
							securityGroups: ['Data Services', 'VS Closing', 'COI other', 'CFO', 'mos.org', 'TrackIT Users', 'HRIS Project 2017', 'Garage Bank', 'CRM System Services', 'Fundware Finance Users', 'Master Planning', 'Mangrove', 'SP_Team_Write_HRIS_Payroll', 'Accounting', 'EIEgrants', 'Payroll Printer', 'SP_Staff', 'Wellness Committee', 'SP_Wellness_Read_Devpages', 'FinanceSSRSUsers', 'Budget_FullAccess', 'SP_Team_Write_ISGT', 'Web VPN Access', 'Lockers', 'MMTfolder', 'COI MOS', 'Business Services', 'WiFi Access', 'PGP_BASIC', 'CompBudget', 'payroll finance', 'SP_Team_Write_NEST', 'Financial Edge', 'SP_Dept_HR_ManagersHandbook', 'ISGT', 'EE Staff', 'Controller', 'Crystal Enterprise', 'SC Purchase Orders', 'Tessitura Finance', 'NISE Finance', 'AnyConnect VPN Access'],
						}, {
							_id: '5dfb8260708c920b2409d894',
							account: 'apetroff',
							employeeID: '014338',
							firstName: 'Annie',
							lastName: 'Petroff',
							firstInitial: 'A',
							lastInitial: 'P',
							displayName: 'Annie Petroff',
							title: 'CRM Manager',
							email: 'apetroff@mos.org',
							officePhone: '617-589-3168',
							mobilePhone: '',
							manager: 'hcalvin',
							department: 'CRM System Services',
							division: 'Visitor Experience & Ops',
							securityGroups: ['Tessitura Training', 'Membership - Aspen', 'TStatsUsers', 'Budget_VisitorServices', 'mos.org', 'LSI_Admits', 'CRM System Services', 'Tessitura Users', 'Tessitura Advancement', 'OneLogin', 'Tessitura Administration', 'SP_Staff', 'FinanceSSRSUsers', 'Tessitura Ticketing', 'SN CRM System Users', 'OS X Users', 'Web VPN Access', 'MMTfolder', 'WiFi Access', 'Tessitura Marketing', 'Tessitura HelpDocs', 'Tessitura Education', 'Budget_RestrictedAccess', 'Tessitura Core Team', 'Tessitura Shared', 'Tessitura Finance', 'AnyConnect VPN Access'],
						},
					];

					hardCodedManagers.forEach((hardCodedManager) => {
						result.docs.push(hardCodedManager);
					});

					// alphabetize the managers
					result.docs.sort(module.exports.ReturnUserNameWeightRelativeToAnother);

					// TO DO - DELETE ABOVE HARD-CODING OF MANAGERS ONCE ALGO HAS BETTER DATA TO CRUNCH

					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),
	// downline, upline
	ReturnDirectReportsForOneManager: mgrAccount =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('adUsers', {
				manager: mgrAccount,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// downline, upline
	ReturnAllManagersWithFlatDownline: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the 
			// 		adManagersWithFullFlatDownlines document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adManagersWithFullFlatDownlines')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),
	// downline, upline
	ReturnAllManagersWithHierarchicalDownline: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the 
			// 		adManagersWithFullFlatDownlines document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adManagersWithFullHierarchicalDownlines')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),
	// downline, upline
	ReturnOneManagerWithFlatDownline: mgrAccount =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('adManagersWithFullFlatDownlines', {
				account: mgrAccount,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// downline, upline
	ReturnOneManagerWithWithHierarchicalDownline: mgrAccount =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the adUsers document collection
			nesoDBQueries.ReturnAllSpecifiedDocsFromCollection('adManagersWithFullHierarchicalDownlines', {
				account: mgrAccount,
			}, {})
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					resolve(result);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
	// downline, upline
	ReturnFullFlatUplineForOneUser: account =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the user's manager, her manger, and so on, using a graph lookup
			nesoDBConnection.get('adUsers')
				.aggregate([
					{ $match: { account } },
					{
						$graphLookup: {
							from: 'adUsers',
							startWith: '$manager',
							connectFromField: 'manager',
							connectToField: 'account',
							as: 'upline',
						},
					},
				])
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => {
					// result[0].upline.forEach((uplineMember) => {
					// 	console.log(uplineMember);
					// });
					resolve(result[0].upline);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),
};
