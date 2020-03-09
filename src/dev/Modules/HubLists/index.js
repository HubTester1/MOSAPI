/**
 * @name XXX
 * @service
 * @description XXX
 */

const DataQueries = require('data-queries');
const MSGraph = require('ms-graph');

module.exports = {

	/**
	 * @name hubListsSettings
	 * @function
	 * @async
	 * @description Return all Hub Lists settings 
	 * (all docs from the 'hubListsSettings' collection).
	 */

	ReturnHubListsSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('hubListsSettings')
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
	 * @name ReturnHubListsWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */

	ReturnHubListsWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHubListsSettings()
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
	 * @name ReturnList
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	ReturnList: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnListFromTokens(eventBody)
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
	 * @name ReturnListItems
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	ReturnListItems: (eventBody) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			MSGraph.ReturnListItemsFromTokens(eventBody)
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
