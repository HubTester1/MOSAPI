
// ----- PULL IN MODULES

const nesoDBQueries = require('./nesoDBQueries');

// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	ReturnHcGetItDoneSettingsData: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the hcGetItDoneSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcGetItDoneSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),


	ReturnHcGetItDoneWhitelistedDomains: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHcGetItDoneSettingsData()
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

	ReturnAllHcGetItDoneItems: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the hcGetItDone document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcGetItDone')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

};
