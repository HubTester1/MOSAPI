
// ----- PULL IN MODULES

const fse = require('fs-extra');
const excel = require('node-xlsx').default;

const nesoDBQueries = require('./nesoDBQueries');
const nesoUtilities = require('./nesoUtilities');
const nesoErrors = require('./nesoErrors');

// ----- DEFINE HR POSITIONS FUNCTIONS

module.exports = {

	ReturnHRPositionsSettings: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hrPositionsSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHRPositionsDataProcessingStatus: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHRPositionsSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						dataProcessingStatus: settings.docs[0].dataProcessingStatus,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHRPositionsDataProcessingNow: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHRPositionsSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						dataProcessingNow: settings.docs[0].dataProcessingNow,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHRPositionsExcelSettings: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHRPositionsSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						excel: settings.docs[0].excelOptions,
					});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHRPositionsWhitelistedDomains: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHRPositionsSettings()
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

	ReplaceAllHRPositionsSettings: newSettings =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHRPositionsSettings()
				// if the promise is resolved with the settings
				.then((existingSettings) => {
					// get a promise to replace the settings in the emailSettings document collection
					nesoDBQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'hrPositionsSettings')
						// if the promise is resolved with the counts, then resolve this promise with the counts
						.then((result) => { resolve(result); })
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => { reject(error); });
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReplaceOneHRPositionsSetting: newSingleSettingObject =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHRPositionsSettings()
				// if the promise is resolved with the settings
				.then((existingSettings) => {
					// get a new version of all settings
					const newSettings = existingSettings.docs[0];
					// get an array containing the property key of newSingleSettingObject; 
					// 		iterate over the array
					Object.keys(newSingleSettingObject).forEach((newSingleSettingKey) => {
						// in the new settings, 
						// 		replace the relevant setting with the value passed to this function
						newSettings[newSingleSettingKey] = newSingleSettingObject[newSingleSettingKey];
					});
					// get a promise to replace the settings in the emailSettings document collection
					nesoDBQueries.OverwriteDocInCollection(existingSettings.docs[0]._id, newSettings, 'hrPositionsSettings')
						// if the promise is resolved with the counts, then resolve this promise with the counts
						.then((result) => { resolve(result); })
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => { reject(error); });
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnNewHRPositionsFilePathAndName: currentFilePathAndName =>
		`${currentFilePathAndName.slice(0, currentFilePathAndName.length - 5)}Copy.xlsx`,

	ReturnAllHRPositionsFromExcel: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve excel settings
			module.exports.ReturnHRPositionsExcelSettings()
				// if the promise to retrieve excel settings is resolved with the settings
				.then((settings) => {
					// try to resolve this promise with the hr positions data
					try {
						// make a copy of the file to read
						const newPositionsFilePathAndName =
							module.exports.ReturnNewHRPositionsFilePathAndName(settings.excel.filePathAndName);
						fse
							.copy(settings.excel.filePathAndName, newPositionsFilePathAndName, { overwrite: true })
							.then(() => {
								// set up empty array to be used if either 
								// 		no data is in the designated worksheet or said worksheet does not exist
								let hrPositions = [];
								// get data from all of the worksheet
								const allWorksheets = excel.parse(fse.readFileSync(newPositionsFilePathAndName));
								// iterate over the worksheets
								allWorksheets.forEach((worksheet) => {
									// if the name of this worksheet matches the designated worksheet
									if (worksheet.name === settings.excel.positionsWorksheetName) {
										// replace hrPositions with the data from this worksheet
										hrPositions = worksheet.data;
									}
								});
								// resolve this promise with a message
								resolve({
									error: false,
									excelError: false,
									hrPositions,
								});
								fse
									.remove(newPositionsFilePathAndName)
									.then(() => {
										// 
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
						// construct a custom error
						const errorToReport = {
							error: true,
							excelError: true,
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with an error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	DeleteAllHRPositionsaFromDatabase: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.DeleteAllDocsFromCollection('hrPositions')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	AddAllHRPositionsToDatabase: hrPositions =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(hrPositions, 'hrPositions')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ProcessHRPositionsData: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve hr positions processing status
			module.exports.ReturnHRPositionsDataProcessingStatus()
				// if the promise is resolved with the setting
				.then((hrPositionsDataProcessingStatus) => {
					// if it's ok to process hr positions
					if (hrPositionsDataProcessingStatus.dataProcessingStatus === true) {
						// get a promise to set dataProcessingNow to true
						module.exports.ReplaceOneHRPositionsSetting({ dataProcessingNow: true })
							// if the promise to set dataProcessingNow to true was resolved
							.then((replaceOneHRPositionsSettingResult) => {
								// get a promise to get all hr positions from excel
								module.exports.ReturnAllHRPositionsFromExcel()
									// if the promise to get all hr positions from excel 
									// 		was resolved with the hr positions
									.then((returnAllHRPositionsFromExcelResult) => {
										// extract the data from the result
										const hrPositionsRaw = returnAllHRPositionsFromExcelResult.hrPositions;
										// remove any empty arrays
										const hrPositionsCleaned = hrPositionsRaw.filter(row => row.length > 0);
										// convert the array of arrays into an array of objects; 
										// 		see function documentation for more info
										const hrPositionsArrayOfObjects =
											// eslint-disable-next-line max-len
											nesoUtilities.ReturnArrayOfArraysWithFirstArrayHeaderAsArrayOfMappedJSONObjects(hrPositionsCleaned);
										// get a promise to delete all hr positions from the database
										module.exports.DeleteAllHRPositionsaFromDatabase()
											// if the promise to delete all hr positions from the database was resolved
											.then((deleteAllHRPositionsaFromDatabaseResult) => {
												// get a promise to add hr positions from excel to the database
												module.exports.AddAllHRPositionsToDatabase(hrPositionsArrayOfObjects)
													// if the promise to add hr positions 
													// 		from excel to the database was resolved
													.then((addAllHRPositionsToDatabaseResult) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneHRPositionsSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow to false 
															// 		was resolved with the result
															.then((replaceOneHRPositionsSettingResultTwo) => {
																// resolve this promise with a message
																resolve({ error: false });
															})
															// if the promise to set dataProcessingNow to false 
															// 		was rejected with an error
															.catch((error) => {
																// reject this promise with the error
																reject(error);
															});
													})
													// if the promise to add hr positions from excel to the database 
													// 		was rejected with an error
													.catch((addAllHRPositionsToDatabaseError) => {
														// get a promise to set dataProcessingNow to false
														module.exports.ReplaceOneHRPositionsSetting({
															dataProcessingNow: false,
														})
															// if the promise to set dataProcessingNow to false 
															// 		was resolved with the result
															.then((replaceOneHRPositionsSettingResultTwo) => {
																// reject this promise with the error
																reject(addAllHRPositionsToDatabaseError);
															})
															// if the promise to add hr positions from excel to the database 
															// 		was rejected with an error
															.catch((replaceOneHRPositionsSettingError) => {
																// construct a custom error
																const errorToReport = {
																	error: true,
																	mongoDBError: true,
																	errorCollection: [
																		addAllHRPositionsToDatabaseError.mongoDBErrorDetails,
																		replaceOneHRPositionsSettingError.mongoDBErrorDetails,
																	],
																};
																// process error
																nesoErrors.ProcessError(errorToReport);
																// reject this promise with the error
																reject(errorToReport);
															});
													});
											})
											// if the promise to delete all hr positions from the database 
											// 		was rejected with an error
											.catch((deleteAllHRPositionsFromDatabaseError) => {
												// get a promise to set dataProcessingNow to false
												module.exports.ReplaceOneHRPositionsSetting({ dataProcessingNow: false })
													// if the promise to set dataProcessingNow to false 
													// 		was resolved with the result
													.then((replaceOneHRPositionsSettingResultTwo) => {
														// reject this promise with the error
														reject(deleteAllHRPositionsFromDatabaseError);
													})
													// if the promise to add hr positions from excel to the database 
													// 		was rejected with an error
													.catch((replaceOneHRPositionsSettingError) => {
														// construct a custom error
														const errorToReport = {
															error: true,
															mongoDBError: true,
															errorCollection: [
																deleteAllHRPositionsFromDatabaseError.mongoDBErrorDetails,
																replaceOneHRPositionsSettingError.mongoDBErrorDetails,
															],
														};
														// process error
														nesoErrors.ProcessError(errorToReport);
														// reject this promise with the error
														reject(errorToReport);
													});
											});
									})
									// if the promise to get all hr positions from excel was rejected with an error
									.catch((returnAllHRPositionsFromExcelError) => {
										// get a promise to set dataProcessingNow to false
										module.exports.ReplaceOneHRPositionsSetting({ dataProcessingNow: false })
											// if the promise to set dataProcessingNow to false 
											// 		was resolved with the result
											.then((replaceOneHRPositionsSettingResultTwo) => {
												// reject this promise with the error
												reject(returnAllHRPositionsFromExcelError);
											})
											// if the promise to add hr positions from excel to the database 
											// 		was rejected with an error
											.catch((replaceOneHRPositionsSettingError) => {
												// construct a custom error
												const errorToReport = {
													error: true,
													mongoDBError: true,
													errorCollection: [
														returnAllHRPositionsFromExcelError.mongoDBErrorDetails,
														replaceOneHRPositionsSettingError.mongoDBErrorDetails,
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
							.catch((error) => { reject(error); });
						// if it's NOT ok to process hr positions
					} else {
						// reject this promise with the error
						reject({
							error: true,
							settingsError: 'dataProcessingStatus === false',
						});
					}
				})
				// if the promise to retrieve hr positions processing status is rejected with an error, 
				// 		then reject this promise with the error
				.catch((error) => { reject(error); });
		}))
	,
};
