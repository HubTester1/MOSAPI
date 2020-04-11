/**
 * @name Health
 * @service
 * @description Performs all health-related operations.
 */

const DataQueries = require('data-queries');

module.exports = {
	

	/**
	 * @name ReturnProductsSchedulesSettingsData
	 * @function
	 * @async
	 * @description Return all products and schedules settings 
	 * (all docs from the 'productsSchedulesSettings' collection).
	 */

	ReturnProductsSchedulesSettingsSettingsData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('productsSchedulesSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	/**
	 * @name ReturnProductsSchedulesWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */
	
	ReturnProductsSchedulesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnProductsSchedulesSettingsSettingsData()
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
	 * @name ReturnHoursExceptions
	 * @function
	 * @async
	 * @description Return hours exceptions data from the mos.org Drupal API
	 */
	
	ReturnHoursExceptions: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve one page of employees
			axios.get('https://www.mos.org/views-api/hours-exceptions')
				// if the promise is resolved
				.then((result) => {
					console.log('RESULT');
					console.log(result);
					/* // if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve({
							error: false,
							onePage: result.data,
						});
						// if status indicates other than success
					} else {
						// create a generic error
						const errorToReport = {
							error: true,
							ultiProError: true,
							ultiProStatus: result.status,
						};
						// reject this promise with the error
						reject(errorToReport);
					} */
				})
				// if the promise is rejected with an error, 
				.catch((error) => {
					// create a generic error
					const errorToReport = {
						error: true,
						ultiProError: true,
						ultiProErrorDetails: error,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
			// get a promise to retrieve all documents
			DataQueries.ReturnAllDocsFromCollection('health')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),	
};
