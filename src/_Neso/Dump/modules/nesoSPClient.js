
// ----- PULL IN MODULES

const envConfig = require('../env.json');
const spauth = require('node-sp-auth');
const axios = require('axios');

// ----- DEFINE SHAREPOINT CLIENT FUNCTIONS

module.exports = {

	ReturnSPListItems: options =>
		// return a new promise
		new Promise((resolve, reject) => {
			// not sure why, but the environment vars must be extracted before use
			const username = envConfig.spUser;
			const password = envConfig.spPass;
			spauth.getAuth(options.syncFrom.spApp, {
				username,
				password,
			})
				.then((auth) => {
					// extract, augment headers; assign to config object
					const { headers } = auth;
					headers.Accept = 'application/json;odata=nometadata';
					const axiosConfig = {
						headers,
					};
					// construct endpoint
					let endpoint = 
						`${options.syncFrom.spApp}/_api/web/lists/getByTitle('${options.syncFrom.spList}')/items?$top=5000`;
					// if fields to expand is a non-empty array
					if (
						typeof (options.syncFrom.spFieldsExpanded) === 'object' &&
						options.syncFrom.spFieldsExpanded[0]
					) {
						// start a select clause
						endpoint += '&$expand=';
						// add each field to be selected
						options.syncFrom.spFieldsExpanded.forEach((expandValue, expandIndex) => {
							if (expandIndex !== 0) {
								endpoint += ',';
							}
							endpoint += expandValue;
						});
					}
					// if fields is a non-empty array
					if (
						typeof (options.syncFrom.spFields) === 'object' &&
						options.syncFrom.spFields[0]
					) {
						// start a select clause
						endpoint += '&$select=';
						// add each field to be selected
						options.syncFrom.spFields.forEach((fieldValue, fieldIndex) => {
							if (fieldIndex !== 0) {
								endpoint += ',';
							}
							endpoint += fieldValue;
						});
					}
					// if filters is a non-empty array
					if (typeof (options.syncFrom.spFilters) === 'object' && options.syncFrom.spFilters[0]) {
						// start a filter clause
						endpoint += '&$filter=';
						// add each filter
						options.syncFrom.spFilters.forEach((filterValue, filterIndex) => {
							if (filterIndex !== 0) {
								endpoint += ' and ';
							}
							endpoint += `${filterValue.field} ${filterValue.operator} ${filterValue.value}`;
						});
					}
					// get a promise to retrieve the data
					axios.get(endpoint, axiosConfig)
						// if the promise is resolved
						.then((result) => {
							// if status indicates success
							if (result.status === 200) {
								// resolve this promise with the list items  
								resolve({ listItemsArray: result.data.value });
							} else {
								// construct a custom error
								const errorToReport = {
									error: true,
									spClientError: true,
									spClientErrorDetails: 'response not 200',
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((error) => { reject(error); });
				});
		}),
};
