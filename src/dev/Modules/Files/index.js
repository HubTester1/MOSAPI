/**
 * @name XXX
 * @service
 * @description XXX
 */

const DataQueries = require('data-queries');
const SP = require('@pnp/sp');
// import { sp } from "@pnp/sp";
// import "@pnp/sp/webs";
// import "@pnp/sp/items";
// import "@pnp/sp/folders";
// import "@pnp/sp/lists";

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
					resolve(result);
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
	 * @name CreateFolder
	 * @function
	 * @async
	 * @description XXX
	 * @param {XXX} XXX
	 */

	CreateFolder: (parentFolderName, folderName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			const filesWeb = new SP.Web('https://bmos.sharepoint.com');
			console.log('------------ filesWeb', filesWeb);
			// get a promise to create the folder
			filesWeb.getFolderByServerRelativeUrl(`/MOSAPIMiscStorage/${parentFolderName}`).folders.add(folderName)
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
		}),

	/**
	 * @name CreateFile
	 * @function
	 * @async
	 * @description XXX
	 * @param {XXX} XXX
	 */

	CreateFile: (parentFolderName, fileName, file) =>
		// return a new promise
		new Promise((resolve, reject) => {
			const filesWeb = new SP.Web('https://bmos.sharepoint.com');
			console.log('------------ filesWeb', filesWeb);
			// get a promise to create the folder
			filesWeb.getFolderByServerRelativeUrl(`/MOSAPIMiscStorage/${parentFolderName}`).files.add(fileName, file, true)
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
		}),
	
};
