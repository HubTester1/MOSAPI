
// ----- PULL IN MODULES

const nesoDBQueries = require('./nesoDBQueries');

// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	ReturnHealthSettingsData: () => 
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('healthSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHealthWhitelistedDomains: () => 
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHealthSettingsData()
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

	ReturnNesoHealthFromDB: () => 
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the nesoHealth document collection
			nesoDBQueries.ReturnAllDocsFromCollection('health')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnNesoHealth: () => 
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the nesoHealth document collection
			module.exports.ReturnNesoHealthFromDB()
			// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
			// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),
};
