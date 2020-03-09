/**
 * @name MSGraph
 * @service
 * @description Query the Microsoft Graph API
 */

const axios = require('axios');
const qs = require('qs');
const Status = require('status');
const Utilities = require('utilities');

module.exports = {

	// GENERAL

	ReturnGraphAuthorizationConfig: (page) => ({
		uri: `https://login.microsoftonline.com/${process.env.graphTenantID}/oauth2/v2.0/token`,
		body: qs.stringify({
			grant_type: 'client_credentials',
			client_id: process.env.graphClientID,
			client_secret: process.env.graphClientSecret,
			scope: 'https://graph.microsoft.com/.default',
		}),
		options: {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			timeout: 5000,
		},
	}),
	
	ReturnGraphAccessToken: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get URI and options
			const config = module.exports.ReturnGraphAuthorizationConfig();
			// get a promise to get an access token
			axios.post(config.uri, config.body, config.options)
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve({
							error: false,
							accessToken: result.data.access_token,
						});
					// if status indicates other than success
					} else {
						// create a generic error
						const errorToReport = {
							error: true,
							msGraphError: true,
							msGraphStatus: result.status,
						};
						// reject this promise with the error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, 
				.catch((error) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: true,
						msGraphErrorDetails: error,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	ReturnGraphQueryConfig: (endpointToken, accessToken) => ({
		uri: `https://graph.microsoft.com/v1.0/${endpointToken}`,
		options: {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			timeout: 30000,
		},
	}),

	ReturnOnePageOfDataFromGraph: (config) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to an access token
			axios.get(
				config.uri,
				config.options,
			)
				// if the promise is resolved
				.then((dataResult) => {
					let onePage;
					let nextLink;
					if (dataResult && dataResult.data && dataResult.data.value) {
						onePage = dataResult.data.value;
					} else if (dataResult && dataResult.data) {
						onePage = dataResult.data;
					}
					if (dataResult && dataResult.data && dataResult.data['@odata.nextLink']) {
						nextLink = dataResult.data['@odata.nextLink'];
					}
					// if status indicates success
					if (dataResult.status === 200) {
						// resolve this promise with the list items
						resolve({
							error: false,
							onePage,
							nextLink,
						});
						// if status indicates other than success
					} else {
						// create a generic error
						const errorToReport = {
							error: true,
							msGraphError: true,
							msGraphURI: config.uri,
							msGraphStatus: dataResult.status,
						};
						// reject this promise with the error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error
				.catch((dataError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'data',
						msGraphErrorDetails: dataError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),
		
	ReturnAllSpecifiedDataFromGraph: (endpointToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					// if status indicates success
					const baseConfig = module.exports.ReturnGraphQueryConfig(
						endpointToken,
						accessTokenResult.accessToken,
					);
					let allValues = [];
					let singleValue;
					// set up recursive function to get all pages of employees
					const AttemptToGetOnePageOfDataFromGraph = (attemptConfig = baseConfig) => {
						// get a promise to retrieve one page of employees
						module.exports.ReturnOnePageOfDataFromGraph(attemptConfig)
							// if the promise is resolved
							.then((dataResult) => {
								// if a page of employees was returned
								if (dataResult.nextLink) {
									// add the page of employees to allEmployees
									allValues = [...allValues, ...dataResult.onePage];
									// make another attempt
									const newAttemptConfig = JSON.parse(JSON.stringify(attemptConfig));
									newAttemptConfig.uri = dataResult.nextLink;
									AttemptToGetOnePageOfDataFromGraph(newAttemptConfig);
									// if we've reached the end of the pages
								} else if (
									dataResult && 
									dataResult.onePage && 
									dataResult.onePage[0]
								) {										
									// add the page of data to allValues
									allValues = [...allValues, ...dataResult.onePage];
									// resolve this promise with all of the values
									resolve({
										error: false,
										allValues,
									});
								} else {
									// add the page of data to singleValue
									singleValue = dataResult.onePage;
									// resolve this promise with all of the employees
									resolve({
										error: false,
										singleValue,
									});
								}
							})
							// if the promise is rejected with an error, 
							.catch((dataError) => {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: 'data',
									msGraphErrorDetails: dataError,
								};
									// reject this promise with an error
								reject(errorToReport);
							});
					};
					// start the first attempt to get a page of employees
					AttemptToGetOnePageOfDataFromGraph();
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'token',
						msGraphErrorDetails: tokenError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	// EMAIL
		
	SendEmailToGraph: (emailData) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					// extract sender
					const senderFormatted = 
						Utilities.ReturnTerseEmailAddressFromFriendly(emailData.from);
					const recipientsFormatted = [];
					// if to property is array
					if (typeof (emailData.to) === 'object') {
						emailData.to.forEach((recipient) => {
							recipientsFormatted.push({
								emailAddress: {
									address: Utilities.ReturnTerseEmailAddressFromFriendly(recipient),
								},
							});
						});
					}
					// if to property is string
					if (typeof (emailData.to) === 'string') {
						recipientsFormatted.push({
							emailAddress: {
								address: Utilities.ReturnTerseEmailAddressFromFriendly(emailData.to),
							},
						});
					}
					const bodyFormatted = {};
					if (emailData.html) {
						bodyFormatted.contentType = 'HTML';
						bodyFormatted.content = emailData.html;
					}
					if (emailData.text) {
						bodyFormatted.contentType = 'text';
						bodyFormatted.content = emailData.text;
					}
					const config = module.exports.ReturnGraphQueryConfig(
						`users/${senderFormatted}/sendMail`,
						accessTokenResult.accessToken,
					);
					config.body = {
						message: {
							subject: `${emailData.subject}`,
							body: bodyFormatted,
							toRecipients: recipientsFormatted,
						},
					};
					axios.post(config.uri, config.body, config.options)
						// if the promise is resolved
						.then((sendResult) => {
							// if status indicates success
							if (sendResult.status === 202) {
								// resolve this promise with the list items
								resolve({
									error: false,
									emailData,
								});
							// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphURI: config.uri,
									msGraphStatus: sendResult.status,
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error
						.catch((sendError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'send',
								msGraphErrorDetails: sendError,
							};
							// reject this promise with an error
							reject(errorToReport);
						});
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'token',
						msGraphErrorDetails: tokenError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	// SP SITES

	ReturnSiteFromToken: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy = 
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// set up endpoint var
			let endpoint = '';
			// if the site token received is root
			if (optionsCopy.siteToken === 'root') {
				// set endpoint accordingly
				endpoint = 'sites/root';
			// if the site teken received is NOT root
			} else {
				// set endpoint accordingly
				endpoint = 
					`sites/bmos.sharepoint.com:/sites/${optionsCopy.siteToken}`;
			}
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				endpoint,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result.singleValue);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: Status.ReturnStatusMessage(20),
					});
				});
		}),

	ReturnAllDrivesInSite: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the relevant site
			module.exports.ReturnSiteFromToken(options)
				// if the promise is resolved with a result
				.then((siteResult) => {
					// get a promise to get the data
					module.exports.ReturnAllSpecifiedDataFromGraph(
						`sites/${siteResult.id}/drives`,
					)
						// if the promise is resolved with a result
						.then((result) => {
							// then resolve this promise with the result
							resolve(result);
						})
						// if the promise is rejected with an error
						.catch((error) => {
							// reject this promise with the error
							reject({
								error: true,
								errorDetails: Status.ReturnStatusMessage(21),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((siteError) => {
					// reject this promise with the error
					reject(siteError);
				});
		}),
	
	ReturnAllListsInSite: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the relevant site
			module.exports.ReturnSiteFromToken(options)
				// if the promise is resolved with a result
				.then((siteResult) => {
					// get a promise to get the data
					module.exports.ReturnAllSpecifiedDataFromGraph(
						`sites/${siteResult.id}/lists`,
					)
						// if the promise is resolved with a result
						.then((result) => {
							// then resolve this promise with the result
							resolve(result);
						})
						// if the promise is rejected with an error
						.catch((error) => {
							// reject this promise with the error
							reject({
								error: true,
								errorDetails: Status.ReturnStatusMessage(23),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((siteError) => {
					// reject this promise with the error
					reject(siteError);
				});
		}),

		
	// DRIVES, FOLDERS, FILES

	ReturnDriveFromID: (driveID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`drives/${driveID}`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: Status.ReturnStatusMessage(21),
					});
				});
		}),

	ReturnDriveFromTokens: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// get a promise to get the drives in the relevant site
			module.exports.ReturnAllDrivesInSite(optionsCopy)
				// if the promise is resolved with a result
				.then((allDrivesResult) => {
					// set up empty drive var
					let requestedDrive;
					// for each drive in the returned array of drives
					allDrivesResult.allValues.forEach((drive) => {
						// if this drive's name matches the name 
						// 		of the drive requested
						if (drive.name === optionsCopy.driveToken) {
							// select this drive as the requested drive
							requestedDrive = drive;
						}
					});
					// if a drive was selected (if requestedDrive 
					// 		is defined and isn't empty)
					if (requestedDrive && requestedDrive.id) {
						// resolve this promise with the selected drive
						resolve(requestedDrive);
					// if a drive was NOT selected
					} else {
						// reject this promise with an error
						reject({
							error: true,
							errorDetails: Status.ReturnStatusMessage(21),
						});
					}
				})
				// if the promise is rejected with an error
				.catch((allDrivesError) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: allDrivesError,
					});
				});
		}),
		
	ReturnDriveImmediateChildrenFromID: (driveID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`drives/${driveID}/root/children`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result.allValues);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: Status.ReturnStatusMessage(22),
					});
				});
		}),

	ReturnDriveImmediateChildrenFromTokens: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// get a promise to get the data
			module.exports.ReturnDriveFromTokens(optionsCopy)
				// if the promise is resolved with a result
				.then((driveResult) => {
					// get a promise to 
					module.exports.ReturnDriveImmediateChildrenFromID(driveResult.id)
						// if the promise is resolved with a result
						.then((childrenResult) => {
							// then resolve this promise with the result
							resolve(childrenResult);
						})
						// if the promise is rejected with an error
						.catch((childrenError) => {
							// reject this promise with the error
							reject(childrenError);
						});
				})
				// if the promise is rejected with an error
				.catch((driveError) => {
					// reject this promise with the error
					reject(driveError);
				});
		}),

	ReturnDriveOneImmediateChildFromTokens: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// get a promise to get the data
			module.exports.ReturnDriveImmediateChildrenFromTokens(optionsCopy)
				// if the promise is resolved with a result
				.then((childrenResult) => {
					// set up empty requested child var
					let requestedChild;
					// for each child in the array of drive children
					childrenResult.forEach((driveChild) => {
						// if this child's name matches the 
						// 		requested child token
						if (driveChild.name === optionsCopy.driveChildToken) {
							// select this child as the requested child
							requestedChild = driveChild;
						}
					});
					// if a requested child was selected (if requestedChild
					// 		is defined and isn't empty)
					if (requestedChild && requestedChild.id) {
						// resolve this promise with the requested child
						resolve(requestedChild);
					// if a requested child was NOT selected
					} else {
						// reject this promise with an error
						reject({
							error: true,
							errorDetails: Status.ReturnStatusMessage(21),
						});
					}
				})
				// if the promise is rejected with an error
				.catch((childrenError) => {
					// reject this promise with the error
					reject(childrenError);
				});
		}),

	// parent can only be root an immediate child of drive - no further nesting handled
	CreateFolderInDriveFromIDs: (driveID, parentID, newFolderName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up endpoint var
			let endpoint = '';
			// if the site token received is root
			if (parentID === 'root') {
				// set endpoint accordingly
				endpoint = `drives/${driveID}/root/children`;
				// if the site teken received is NOT root
			} else {
				// set endpoint accordingly
				endpoint =
					`drives/${driveID}/items/${parentID}/children`;
			}
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					const config = module.exports.ReturnGraphQueryConfig(
						endpoint,
						accessTokenResult.accessToken,
					);
					config.body = {
						name: newFolderName,
						folder: {},
						'@microsoft.graph.conflictBehavior': 'rename',
					};
					axios.post(config.uri, config.body, config.options)
						// if the promise is resolved
						.then((createResult) => {
							// if status indicates success
							if (createResult.status === 201) {
								// resolve this promise with the list items
								resolve({
									error: false,
									msGraphURI: config.uri,
									requestedName: newFolderName,
									createdName: createResult.data.name,
								});
								// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphURI: config.uri,
									msGraphStatus: createResult.status,
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error
						.catch((createError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'send',
								msGraphErrorDetails: createError,
							};
							// reject this promise with an error
							reject(errorToReport);
						});
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'token',
						msGraphErrorDetails: tokenError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	// siteToken
	// driveToken
	// parentToken
	// newFolderName
	CreateFolderInDriveFromTokens: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// get a promise to get the data
			module.exports.ReturnDriveFromTokens(optionsCopy)
				// if the promise is resolved with a result
				.then((driveResult) => {
					// set up a container for the promise to identify the parent
					const parentIdentificationPromise = [];
					// if the parent token is 'root'
					if (optionsCopy.parentToken === 'root') {
						// push to container a promise resolved with 'root'
						parentIdentificationPromise.push(
							Promise.resolve('root'),
						);
					// if the parent token is NOT 'root'
					} else {
						// push to container a promise to get all drive children
						parentIdentificationPromise.push(
							module.exports.ReturnDriveImmediateChildrenFromID(
								driveResult.id,
							),
						);
					}
					// get a promise to 
					Promise.all(parentIdentificationPromise)
						// if the promise is resolved with a result
						.then((parentIdentificationResult) => {
							// set up empty parent ID var and extract parent ID result
							let parentID;
							let parentIDResult;
							if (
								parentIdentificationResult && 
								parentIdentificationResult[0] && 
								parentIdentificationResult[0].allValues
							) {
								parentIDResult = parentIdentificationResult[0].allValues;
							} else if (
								parentIdentificationResult && 
								parentIdentificationResult[0]
							) {
								[parentIDResult] = parentIdentificationResult;
							}
							
							// if the parent ID result is 'root'
							if (parentIDResult === 'root') {
								// set parent ID to 'root'
								parentID = 'root';
							// if the parent ID result is NOT 'root'
							} else {
								// then it should be an array of drive children;
								// 		rename for clarity
								const driveChildren = parentIDResult;
								// for each child in the array of drive children
								driveChildren.forEach((driveChild) => {
									// if this child's name matches the 
									// 		requested parent ID token
									if (driveChild.name === optionsCopy.parentToken) {
										// select this child as the parent ID
										parentID = driveChild.id;
									}
								});
							}
							// if a parent ID was defined
							if (parentID) {
								// get a promise to use collected data 
								// 		to create folder in drive
								module.exports.CreateFolderInDriveFromIDs(
									driveResult.id,
									parentID,
									optionsCopy.newFolderName,
								)
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
							// if a parent ID was NOT defined
							} else {
								// reject this promise with an error
								reject({
									error: true,
									errorDetails: Status.ReturnStatusMessage(21),
								});
							}
						})
						// if the promise is rejected with an error
						.catch((parentIdentificationError) => {
							// reject this promise with the error
							reject(parentIdentificationError);
						});
				})
				// if the promise is rejected with an error
				.catch((driveError) => {
					// reject this promise with the error
					reject(driveError);
				});
		}),

	CreateFileInDrive: (driveID, parentID, fileName, fileBinary, fileType) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get an access token
			module.exports.ReturnGraphAccessToken()
				// if the promise is resolved with the token
				.then((accessTokenResult) => {
					const config = module.exports.ReturnGraphQueryConfig(
						`drives/${driveID}/items/${parentID}:/${fileName}/content`,
						accessTokenResult.accessToken,
						fileType,
					);
					config.body = fileBinary;
					axios.put(config.uri, config.body, config.options)
						// if the promise is resolved
						.then((createResult) => {
							// if status indicates success
							if (createResult.status === 201) {
								// resolve this promise with the list items
								resolve({
									error: false,
									msGraphURI: config.uri,
									fileName,
									createResult,
								});
								// if status indicates other than success
							} else {
								// create a generic error
								const errorToReport = {
									error: true,
									msGraphError: true,
									msGraphURI: config.uri,
									msGraphStatus: createResult.status,
								};
								// reject this promise with the error
								reject(errorToReport);
							}
						})
						// if the promise is rejected with an error
						.catch((createError) => {
							// create a generic error
							const errorToReport = {
								error: true,
								msGraphError: 'send',
								msGraphErrorDetails: createError,
							};
							// reject this promise with an error
							reject(errorToReport);
						});
				})
				// if the promise is rejected with an error, 
				.catch((tokenError) => {
					// create a generic error
					const errorToReport = {
						error: true,
						msGraphError: 'token',
						msGraphErrorDetails: tokenError,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	// LISTS

	ReturnListFromID: (siteID, listID) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				`sites/${siteID}/lists/${listID}`,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: Status.ReturnStatusMessage(23),
					});
				});
		}),

	ReturnListFromTokens: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// get a promise to get the lists in the relevant site
			module.exports.ReturnAllListsInSite(optionsCopy)
				// if the promise is resolved with a result
				.then((allListsResult) => {
					// set up empty list var
					let requestedList;
					// for each list in the returned array of list
					allListsResult.forEach((list) => {
						// if this list's name matches the name
						// 		of the list requested
						if (list.name === optionsCopy.listToken) {
							// select this list as the requested list
							requestedList = list;
						}
					});
					// if a list was selected (if requestedList
					// 		is defined and isn't empty)
					if (requestedList && requestedList.id) {
						// resolve this promise with the selected list
						resolve(requestedList);
					// if a list was NOT selected
					} else {
						// reject this promise with an error
						reject({
							error: true,
							errorDetails: Status.ReturnStatusMessage(21),
						});
					}
				})
				// if the promise is rejected with an error
				.catch((allDrivesError) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: allDrivesError,
					});
				});
		}),

	// https://graph.microsoft.com/v1.0/sites/root/lists/00cf2efa-2bd8-409a-b3ca-e484c6669015/items?expand=fields(select=URL,ID,Category)&filter=fields/ID eq 5
	ReturnListItemsFromIDs: (siteID, listID, fieldsArray, filterString) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// construct the endpoint
			let endpoint = `sites/${siteID}/lists/${listID}/items?expand=fields`;
			if (fieldsArray && fieldsArray[0]) {
				endpoint += '(select=';
				fieldsArray.forEach((fieldValue, fieldIndex) => {
					endpoint += fieldValue;
					if ((fieldIndex + 1) !== fieldsArray.length) {
						endpoint += ',';
					}
				});
				endpoint += ')';
			}
			if (filterString) {
				endpoint += `&filter=fields/${filterString}`;
			}
			// get a promise to get the data
			module.exports.ReturnAllSpecifiedDataFromGraph(
				endpoint,
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject({
						error: true,
						errorDetails: Status.ReturnStatusMessage(24),
					});
				});
		}),

	ReturnListItemsFromTokens: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter and ensure
			// 		options is an object
			const optionsCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(options);
			// get a promise to get the site
			module.exports.ReturnSiteFromToken(options)
				// if the promise is resolved with a result
				.then((siteResult) => {
					// get a promise to get the list
					module.exports.ReturnListFromTokens(options)
						// if the promise is resolved with a result
						.then((listResult) => {
							// get a promise to get the data
							module.exports.ReturnListItemsFromIDs(
								siteResult.id,
								listResult.id,
								optionsCopy.fieldsArray,
								optionsCopy.filterString,
							)
								// if the promise is resolved with a result
								.then((itemsMetadataResult) => {
									// then resolve this promise with the result
									resolve(itemsMetadataResult);
								})
								// if the promise is rejected with an error
								.catch((itemsMetadataError) => {
									// reject this promise with the error
									reject(itemsMetadataError);
								});
						})
						// if the promise is rejected with an error
						.catch((listError) => {
							// reject this promise with the error
							reject(listError);
						});
				})
				// if the promise is rejected with an error
				.catch((siteError) => {
					// reject this promise with the error
					reject(siteError);
				});
		}),

};
