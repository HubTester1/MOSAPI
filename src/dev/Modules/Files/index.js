/**
 * @name Files
 * @service
 * @description XXX
 */

const DataQueries = require('data-queries');
const MSGraph = require('ms-graph');

module.exports = {

	/**
	 * @name ReturnFilesSettings
	 * @function
	 * @async
	 * @description Return all health settings 
	 * (all docs from the 'filesSettings' collection).
	 */

	ReturnFilesSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('filesSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result.docs[0]);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnFilesWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */

	ReturnFilesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnFilesSettings()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						whitelistedDomains: settings.whitelistedDomains,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	ReturnDrive: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnDriveFromTokens(eventBody)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	ReturnDriveChildren: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnDriveImmediateChildrenFromTokens(eventBody)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	ReturnDriveChild: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnDriveOneImmediateChildFromTokens(eventBody)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	CreateFolder: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.CreateFolderInDriveFromTokens(eventBody)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	CreateFile: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.CreateFileInDrive(eventBody)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),
	
};
