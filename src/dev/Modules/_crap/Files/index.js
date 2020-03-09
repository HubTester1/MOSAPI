/**
 * @name Files
 * @service
 * @description Handle all file, folder, and drive operations. 
 * IMPORTANT NOTE: This module does not currently facilitate 
 * CRUD operations on files themselves. File operations must
 * be performed by clients, e.g., using the PNP JS library.
 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');

module.exports = {

	/**
	 * @name ReturnFilesSettings
	 * @function
	 * @async
	 * @description XXX
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
	 * @description XXX
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
	 * @name CreateFolder
	 * @function
	 * @async
	 * @description XXX
	 * @param {XXX} XXX
	 * @todo Redo other module function params as options arg that gets converted to object - like this one
	 */

	// CreateFolder: (options) =>
	// 	// return a new promise
	// 	new Promise((resolve, reject) => {
	// 		const optionsCopy =
	// 			Utilities.ReturnUniqueObjectGivenAnyValue(options);
	// 		sp.setup({
	// 			sp: {
	// 				fetchClientFactory: () => new SPFetchClient('https://bmos.sharepoint.com', process.env.spClientID, process.env.spClientSecret),
	// 			},
	// 		});
	// 		sp.web.select('Title', 'Description').get()
	// 			.then((w) => {
	// 				console.log(JSON.stringify(w, null, 4));
	// 			});
	/* const filesWeb = new sp.Web('https://bmos.sharepoint.com');
			console.log('------------ filesWeb', filesWeb);
			// get a promise to create the folder
			filesWeb.getFolderByServerRelativeUrl(`/MOSAPIMiscStorage/${optionsCopy.parentFolderName}`).folders.add(optionsCopy.folderName)
				// if the promise is resolved with a result
				.then((result) => {
					console.log('result');
					console.log(result);
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					console.log('error');
					console.log(error);
					// reject this promise with the error
					reject(error);
				}); */
	// }),

	/**
	 * @name CreateFile
	 * @function
	 * @async
	 * @description XXX
	 * @param {XXX} XXX
	 */

	/* CreateFile: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			const optionsCopy = 
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			const filesWeb = new SP.Web('https://bmos.sharepoint.com');
			console.log('------------ filesWeb', filesWeb);
			// get a promise to create the folder
			filesWeb.getFolderByServerRelativeUrl(`/MOSAPIMiscStorage/${optionsCopy.parentFolderName}`).files.add(optionsCopy.fileName, optionsCopy.file, true)
				// if the promise is resolved with a result
				.then((result) => {
					console.log('result');
					console.log(result);
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					console.log('error');
					console.log(error);
					// reject this promise with the error
					reject(error);
				});
		}), */
	
};
