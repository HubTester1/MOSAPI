/**
 * @name Hub Sites
 * @service
 * @description XXX
 */

const DataQueries = require('data-queries');
const MSGraph = require('ms-graph');

module.exports = {


	/**
	 * @name ReturnHubSitesSettingsData
	 * @function
	 * @async
	 * @description Return all Hub Sites settings 
	 * (all docs from the 'hubSitesSettings' collection).
	 */

	ReturnHubSitesSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('hubSitesSettings')
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
	 * @name ReturnHubSitesWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */

	ReturnHubSitesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHubSitesSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
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

	ReturnSite: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnSiteFromToken(eventBody)
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

	ReturnAllDrives: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnAllDrivesInSite(eventBody)
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

	ReturnAllLists: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnAllListsInSite(eventBody)
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
