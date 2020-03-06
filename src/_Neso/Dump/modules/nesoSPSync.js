
// ----- PULL IN MODULES

const nesoSPClient = require('./nesoSPClient');
const nesoDBQueries = require('./nesoDBQueries');
// const nesoErrors = require('./nesoErrors');


// ----- DEFINE SHAREPOINT SYNCING FUNCTIONS

module.exports = {

	ReturnSPSyncSettingsData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('spSyncSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	ReturnSPSyncWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnSPSyncSettingsData()
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
		}),

	SyncListItems: options =>
		// return a new promise
		new Promise((resolve, reject) => {
			// clone incoming param
			const optionsClone = options;
			// construct full site URL
			optionsClone.syncFrom.spApp = `https://bmos.sharepoint.com/sites/${options.syncFrom.spApp}`;
			// get a promise to get the list
			nesoSPClient
				.ReturnSPListItems(optionsClone)
				// if the promise is resolved with the list items
				.then((returnListItemsResults) => {
					// get a promise to delete all items in the specified collection
					nesoDBQueries.DeleteAllDocsFromCollection(options.syncTo.mongoCollection)
						// if the promise is resolved with the result, then 
						// 		resolve this promise with the result
						.then((deletionResult) => {
							// set up container for processed list items
							const listItemsProcessed = [];
							// for each returned list item
							returnListItemsResults.listItemsArray.forEach((listItem) => {
								// make copy of param
								const listItemCopy = listItem;
								// if listItem.AllRequestData exists
								if (listItem.AllRequestData) {
									// extract the AllRequestData string
									let temporaryAllRequestData = listItem.AllRequestData;
									// replace some characters in the string
									// eslint-disable-next-line no-control-regex
									const regexOne = new RegExp('\r', 'g');
									// eslint-disable-next-line no-control-regex
									const regexTwo = new RegExp('\n', 'g');
									temporaryAllRequestData = temporaryAllRequestData.replace(regexOne, "'");
									temporaryAllRequestData = temporaryAllRequestData.replace(regexTwo, "'");
									// get object from string
									// eslint-disable-next-line prefer-const
									let formDataObj = {};
									// eslint-disable-next-line no-eval
									eval(`formDataObj=${temporaryAllRequestData}`);
									// replace the string with the object in the list item copy
									listItemCopy.AllRequestData = formDataObj;
								}
								// push the list item copy to the processed array
								listItemsProcessed.push(listItemCopy);
							});
							// get a promise to insert the processed list items into the collection
							nesoDBQueries
								.InsertDocIntoCollection(listItemsProcessed, options.syncTo.mongoCollection)
								// if the promise is resolved with the result, then 
								// 		resolve this promise with the result
								.then((insertionResult) => { resolve(insertionResult); })
								// if the promise is rejected with an error, then 
								// 		reject this promise with an error
								.catch((error) => { reject(error); });
						})
						// if the promise is rejected with an error, then 
						// 		reject this promise with an error
						.catch((error) => { reject(error); });
				})
				// if the promise is rejected with an error, then 
				// 		reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	SyncGSEApprovedJobsListItems: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// specify sync options
			const options = {
				syncFrom: {
					spApp: 'hr-service-jobs',
					spList: 'SWFList',
					spFields: [
						'Id',
						'JobTitle',
						// 'JobAdmin/EMail',
						'Location',
						'AllRequestData',
					],
					// spFieldsExpanded: ['JobAdmin'],
					spFilters: [
						{
							field: 'RequestStatus',
							operator: 'eq',
							value: '\'Approved\'',
						},
					],
				},
				syncTo: {
					mongoCollection: 'gseApprovedJobs',
				},
			};
			// get a promise to sync the list items
			module.exports.SyncListItems(options)
				// if the promise is resolved with the result, then 
				// 		resolve this promise with the result
				.then((syncResult) => { resolve(syncResult); })
				// if the promise is rejected with an error, then 
				// 		reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	SyncGSESubmittedSchedulesListItems: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// specify sync options
			const options = {
				syncFrom: {
					spApp: 'hr-service-schedules',
					spList: 'SWFList',
					spFields: [
						'Id',
						'JobID',
						'Date',
						'StartTime',
						'AllRequestData',
					],
					spFilters: [
						{
							field: 'RequestStatus',
							operator: 'eq',
							value: '\'Submitted\'',
						},
					],
				},
				syncTo: {
					mongoCollection: 'gseSubmittedSchedules',
				},
			};
			// get a promise to sync the list items
			module.exports.SyncListItems(options)
				// if the promise is resolved with the result, then 
				// 		resolve this promise with the result
				.then((syncResult) => { resolve(syncResult); })
				// if the promise is rejected with an error, then 
				// 		reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	SyncGSESignedUpSignupsListItems: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// specify sync options
			const options = {
				syncFrom: {
					spApp: 'hr-service-signups',
					spList: 'SWFList',
					spFields: [
						'Id',
						'ScheduleID',
						'AllRequestData',
					],
					spFilters: [
						{
							field: 'RequestStatus',
							operator: 'eq',
							value: '\'Signed Up\'',
						},
					],
				},
				syncTo: {
					mongoCollection: 'gseSignedUpSignups',
				},
			};
			// get a promise to sync the list items
			module.exports.SyncListItems(options)
				// if the promise is resolved with the result, then 
				// 		resolve this promise with the result
				.then((syncResult) => { resolve(syncResult); })
				// if the promise is rejected with an error, then 
				// 		reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	SyncGSECompletedInDateRangeSchedulesListItems: (startDate, endDate) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// specify sync options
			const options = {
				syncFrom: {
					spApp: 'hr-service-schedules',
					spList: 'SWFList',
					spFields: [
						'Id',
						'Date',
						'ShiftLength',
						'JobID',
					],
					spFilters: [
						{
							field: 'RequestStatus',
							operator: 'eq',
							value: '\'Completed\'',
						}, {
							field: 'Modified',
							operator: 'ge',
							value: `'${startDate}'`,
						}, {
							field: 'Modified',
							operator: 'le',
							value: `'${endDate}'`,
						},
					],
				},
				syncTo: {
					mongoCollection: 'gseCompletedInDateRangeSchedules',
				},
			};
			// get a promise to sync the list items
			module.exports.SyncListItems(options)
				// if the promise is resolved with the result, then 
				// 		resolve this promise with the result
				.then((syncResult) => { resolve(syncResult); })
				// if the promise is rejected with an error, then 
				// 		reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	SyncGSECreditGrantedInDateRangeSignupsListItems: (startDate, endDate) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// specify sync options
			const options = {
				syncFrom: {
					spApp: 'hr-service-signups',
					spList: 'SWFList',
					spFields: [
						'Id',
						'ScheduleID',
						'AllRequestData',
					],
					spFilters: [
						{
							field: 'RequestStatus',
							operator: 'eq',
							value: '\'Credit Granted\'',
						}, {
							field: 'Modified',
							operator: 'ge',
							value: `'${startDate}'`,
						}, {
							field: 'Modified',
							operator: 'le',
							value: `'${endDate}'`,
						},
					],
				},
				syncTo: {
					mongoCollection: 'gseCreditGrantedInDateRangeSignups',
				},
			};
			// get a promise to sync the list items
			module.exports.SyncListItems(options)
				// if the promise is resolved with the result, then 
				// 		resolve this promise with the result
				.then((syncResult) => { resolve(syncResult); })
				// if the promise is rejected with an error, then 
				// 		reject this promise with an error
				.catch((error) => { reject(error); });
		}),
};
