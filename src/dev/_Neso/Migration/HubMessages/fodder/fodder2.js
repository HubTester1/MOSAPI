/**
 * @name Hub Messages
 * @api
 * @description Handles all Hub Messages-related requests.
 */

const HubMessages = require('hub-messages');
const Access = require('access');
const Response = require('response');
// ++++++++++++++++++++++++++
const DataQueries = require('data-queries');
const Utilities = require('utilities');
const moment = require('moment');
const axios = require('axios');
const S3FS = require('s3fs');
const sharp = require('sharp');
const uuid = require('uuid');
// const urlExists = require('url-exists');

/**
 * @typedef {import('../../../../TypeDefs/HubMessage').HubMessage} HubMessage
 */

module.exports = {

	/**
	 * @name ReturnHubMessagesSettings
	 * @function
	 * @description Return all Hub Messages settings
	 * (all docs from the 'hubMessagesSettings' collection).
	 */

	ReturnHubMessagesSettings: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('hubMessagesSettings')
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
	 * @name ReturnHubMessagesWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 */

	ReturnHubMessagesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHubMessagesSettings()
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
	 * @name ReturnNextMessageIDAndIterate
	 * @function
	 * @async
	 * @description Return the next message ID and then add 1 to it.
	 */

	ReturnNextMessageIDAndIterate: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries.ReturnAllDocsFromCollection('hubMessagesSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// get a promise to 
					module.exports.IterateNextMessageID(result.docs[0])
						// if the promise is resolved with a result
						.then((iterationResult) => {
							// resolve this promise with the ID
							resolve({
								error: false,
								docs: {
									nextMessageID: result.docs[0].nextMessageID,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((iterationError) => {
							// reject this promise with the error
							reject({
								error: false,
								docs: {
									nextMessageID: result.docs[0].nextMessageID,
									iterationError,
								},
							});
						});
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	/**
	 * @name IterateNextMessageID
	 * @function
	 * @async
	 * @description Add 1 to the next message ID.
	 */

	IterateNextMessageID: (existingSettings) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			const newNextMessageID = existingSettings.nextMessageID + 1;
			// get a promise to replace the settings in the hcMessagesSettings document collection
			DataQueries
				.UpdateSpecificFieldInSpecificDocsInCollection(
					'hubMessagesSettings',
					'_id',
					existingSettings._id,
					true,
					'nextMessageID',
					newNextMessageID,
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
		}),

	/**
	 * @name AddImages
	 * @function
	 * @async
	 * @description Resize images, convert to JPG (if necessary), store, return data.
	 */

	ReturnFileTextContentAsBinary: (incomingFileContent) => incomingFileContent.split('').map((char) => char.charCodeAt(0).toString(2)).join(' '),


	// ---------------------


	/**
	 * @name ReturnSpecifiedMessages
	 * @function
	 * @async
	 * @description Return messages specified by options param
	 * @todo Create message options model and doc param
	 */

	ReturnSpecifiedMessages: (options = {}) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// start off query object
			const queryObject = {};
			// if there's an expiration option
			if (options.expiration) {
				// if expiration option is unexpired
				if (options.expiration === 'unexpired') {
					// specify querying for messages where expiration is 
					// 		greater than or equal to now
					queryObject.messageExpiration = { $gte: new Date() };
				}
				// if expiration option is expired
				if (options.expiration === 'expired') {
					// specify querying for messages where expiration is 
					// 		less than now
					queryObject.messageExpiration = { $lt: new Date() };
				}
			}
			// if there's an tag option
			if (options.tag) {
				// specify querying for messages with specified tag
				queryObject.messageTag = options.tag;
			}
			// get a promise to 
			DataQueries.ReturnSpecifiedLimitedDocsFromCollectionSorted(
				'hubMessages',
				queryObject,
				'messageCreated',
				'descending',
				parseInt(options.limit, 10),
			)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					const messagesWithPinnedFirst =
						module.exports.ReturnAnyMessageSetPinnedFirst(result.docs);
					resolve({
						error: false,
						mongoDBError: false,
						docs: messagesWithPinnedFirst,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					// nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
				});
		}),

	ReturnAnyMessageSetPinnedFirst: (messagesArray) => {
		// set up container arrays
		const messagesNotPinned = [];
		const messagesPinned = [];
		let allMessages = [];
		// for each message
		messagesArray.forEach((message) => {
			// if this message has a pinnedUntil property and
			// 		the pinnedUntil datetime is in the future
			if (
				message.pinnedUntil &&
				moment(message.pinnedUntil).isAfter(moment())
			) {
				// push this message to the messagesPinned array
				messagesPinned.push(message);
				// if this message has no pinnedUntil property OR 
				// 		the pinnedUntil dateime is NOT in the future
			} else {
				// push this message to the messagesNotPinned array
				messagesNotPinned.push(message);
			}
		});
		// concatenate message arrays, with pinned messages first
		allMessages = messagesPinned.concat(messagesNotPinned);
		// return array of messages, with pinned messages first
		return allMessages;
	},

	/**
	 * @name AddMessage
	 * @function
	 * @async
	 * @description Adds a message to the database.
	 * @param {...HubMessage} incomingMessage - {@link HubMessage} object
	 */

	AddMessage: (incomingMessage) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const incomingMessageCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(incomingMessage);
			// weed out some unnecessary image data
			const messageToInsert = {
				messageID: incomingMessageCopy.newMessageID,
				messageTag: incomingMessageCopy.newMessageTag,
				messageSubject: incomingMessageCopy.newMessageSubject,
				messageBody: incomingMessageCopy.newMessageBody,
				messageImages: incomingMessageCopy.newMessageImages,
				messageCreated: new Date(),
				messageCreator: incomingMessageCopy.newMessageCreator,
				messageModified: new Date(),
			};
			if (incomingMessageCopy.newMessageExpirationDate === '') {
				messageToInsert.messageExpiration = moment().add(180, 'days').toDate();
			} else {
				messageToInsert.messageExpiration =
					moment(incomingMessageCopy.newMessageExpirationDate).toDate();
			}

			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries.InsertDocIntoCollection(messageToInsert, 'hubMessages')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	/**
	 * @name UpdateMessage
	 * @function
	 * @async
	 * @description Updates a message already in the database.
	 * @param {object} incomingMessage - object comprising new message
	 */

	UpdateMessage: (incomingMessage) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// preserve function parameter
			const incomingMessageCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(incomingMessage);
			const messagePropsToSet = [
				{ key: 'messageTag', value: incomingMessageCopy.newMessageTag },
				{ key: 'messageSubject', value: incomingMessageCopy.newMessageSubject },
				{ key: 'messageBody', value: incomingMessageCopy.newMessageBody },
				{ key: 'messageImages', value: incomingMessageCopy.newMessageImages },
				{
					key: 'messageExpiration',
					value: moment(incomingMessageCopy.newMessageExpirationDate).toDate(),
				},
				{
					key: 'messageModified',
					value: new Date(),
				},
			];
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries
				.UpdateSpecificFieldsInSpecificDocsInCollection('hubMessages', 'messageID', incomingMessageCopy.newMessageID, false, messagePropsToSet)
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),


	// ---------------------


	ReturnAllMessagesData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			axios.get('https://neso.mos.org/hcMessages/messages/all')
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result.data.docs);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	StoreOneConvertedMessage: (messageToInsert) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			DataQueries.InsertDocIntoCollection(messageToInsert, 'hubMessages')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	ReturnOneNewMessage: (oldMessage) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to return all of the old message's 
			// 		images that actually exist on Neso
			module.exports.ReturnAllOldImagesThatExist(oldMessage.messageImages)
				// when the promise is resolved with the existing old images,
				// 		as it always will be even if there are none
				.then((existingOldImages) => {
					// console.log('existingOldImages');
					// console.log(existingOldImages);
					// set up container for new image objects
					const newMessageImages = [];
					// for each of the existing old images
					existingOldImages.forEach((oldImage) => {
						// push to container a constructed new message object
						newMessageImages.push({
							name: oldImage.name,
							url: `https://mos-api-misc-storage.s3.amazonaws.com/hub-message-assets/formatted/${oldMessage.messageID}/${oldImage.name}.jpg`,
							key: uuid.v4(),
						});
					});
					// construct new message object
					const newMessage = {
						messageID: oldMessage.messageID,
						messageTag: oldMessage.messageTags[0].name,
						messageSubject: oldMessage.messageSubject,
						messageBody: oldMessage.messageBody,
						messageImages: newMessageImages,
						messageCreated: oldMessage.messageCreated,
						messageCreator: oldMessage.messageCreator,
						messageModified: oldMessage.messageModified,
						messageExpiration: oldMessage.messageExpiration,
					};
					// resolve this promise with the new message
					resolve(newMessage);
				});
		}),

	ConvertAndStoreAllMessagesData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			DataQueries.DeleteAllDocsFromCollection('hubMessages')
				// if the promise is resolved with a result
				.then((deletionResult) => {
					// get a promise to 
					module.exports.ReturnAllMessagesData()
						// if the promise is resolved with a result
						.then((allMessagesData) => {
							// set up container for message storage promises
							const allNewMessageRetrievalPromises = [];
							const allNewMessageStoragePromises = [];
							// for each old message
							allMessagesData.forEach((oldMessage) => {
								allNewMessageRetrievalPromises.push(
									module.exports.ReturnOneNewMessage(oldMessage),
								);
							});
							// when all message retrieval promises have been fulfilled
							Promise.all(allNewMessageRetrievalPromises)
								// when the promise is resolved with a result
								.then((messageRetrievalResults) => {
									// for each message retrieved
									messageRetrievalResults.forEach((newMessage) => {
										allNewMessageStoragePromises.push(
											module.exports.StoreOneConvertedMessage(newMessage),
										);
									});
									Promise.all(allNewMessageStoragePromises)
										// if the promise is resolved with a result
										.then((result) => {
											// then resolve this promise with the result
											resolve({});
										})
										// if the promise is rejected with an error
										.catch((error) => {
											// reject this promise with the error
											reject(error);
										});
								});
						})
						// if the promise is rejected with an error
						.catch((allMessagesError) => {
							// reject this promise with the error
							reject({ allMessagesError });
						});
				})
				// if the promise is rejected with an error
				.catch((deletionError) => {
					// reject this promise with the error
					reject(deletionError);
				});
		}),

	ReturnOldImageURL: (oldImage) => (oldImage.urlLarge ?
		oldImage.urlLarge :
		oldImage.uriQuark),
		
	ReturnAllOldImagesThatExist: (oldImageArray = []) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up a container for promises to check that 
			// 		the image actually exists
			const oldImageCheckingPromises = [];
			// for each old message image
			oldImageArray.forEach((oldImage) => {
				// push to container a promise to determine the existence of the image
				oldImageCheckingPromises
					.push(
						module.exports.ReturnResourceExistsAtURI(
							module.exports.ReturnOldImageURL(oldImage),
						),
					);
			});
			// when all promises to check existence have been fulfilled
			Promise.all(oldImageCheckingPromises)
				// if all promises were resolved, and they always will be
				.then((allExistenceResults) => {
					// set up container for the images to return
					const imagesThatExist = [];
					// for each old message image
					oldImageArray.forEach((oldImage) => {
						// get the old url for the old image
						const oldImageURI = module.exports.ReturnOldImageURL(oldImage);
						// for each existence result
						allExistenceResults.forEach((existenceResult) => {
							if (
								existenceResult.uri === oldImageURI &&
								existenceResult.exists
							) {
								imagesThatExist.push(oldImage);
							}
						});
					});
					resolve(imagesThatExist);
					/* // if the image exists
					if (existenceResult) {
						// construct a new image object and push it
						// 		to the container
						newMessageImages.push({
							name: oldImage.name,
							url: `https://mos-api-misc-storage.s3.amazonaws.com/hub-message-assets/formatted/${oldMessage.messageID}/${oldImage.name}.jpg`,
							key: uuid.v4(),
						});
					} */
				});
		}),

	ReturnResourceExistsAtURI: (uri) =>
		// return a new promise
		new Promise((resolve, reject) => {
			const HandleResponse = (response) => {
				let existenceFlag = false;
				// response.status = 200
				// response.response.status = 400
				if (
					response &&
					response.status &&
					response.status === 200
				) {
					existenceFlag = true;
				}
				resolve({
					uri,
					exists: existenceFlag,
				});
			};
			axios.head(uri)
				.then((response) => {
					HandleResponse(response);
				})
				.catch((response) => {
					HandleResponse(response);
				});
		}),

	ReadAndStoreOneMessageImage: async (messageID, fileName, oldURL) => {
		// set up promise container vars
		const S3FileSystem = module.exports.TempReturnS3FileSystem('mos-api-misc-storage');
		const writeFilePath = `/hub-message-assets/formatted/${messageID}/${fileName}`;
		const writer = S3FileSystem.createWriteStream(writeFilePath);
		const response = await axios({
			method: 'get',
			url: oldURL,
			responseType: 'stream',
		});

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', resolve);
		});
	},

	AttemptToReadAndStoreOneMessageImage: (messageID, fileName, oldURL) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to determine whether or not image exists
			module.exports.ReturnResourceExistsAtURI(oldURL)
				// if the promise is resolved with a result
				.then((existenceResult) => {
					if (existenceResult.exists) {
						// get a promise to 
						module.exports.ReadAndStoreOneMessageImage(
							messageID, fileName, oldURL,
						)
							// if the promise is resolved with a result
							.then(resolve())
							// if the promise is rejected with an error
							.catch(resolve());
					} else {
						resolve();
					}
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					resolve();
				});
		}),

	ReadAndStoreAllMessageImages: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			module.exports.ReturnAllMessagesData()
				// if the promise is resolved with a result
				.then((allMessagesData) => {
					const allImageStoragePromises = [];
					allMessagesData.forEach((oldMessage) => {
						if (
							oldMessage.messageImages &&
							oldMessage.messageImages[0]
						) {
							oldMessage.messageImages
								.forEach((imageObject) => {
									const oldURL = module.exports.ReturnOldImageURL(imageObject);
									// console.log('oldURL', oldURL);
									allImageStoragePromises.push(
										module.exports
											.AttemptToReadAndStoreOneMessageImage(
												oldMessage.messageID,
												imageObject.name,
												oldURL,
											),
									);
								});
						}
					});
					// get a promise to 
					Promise.all(allImageStoragePromises)
						// if the promise is resolved with a result
						.then((result) => {
							// then resolve this promise with the result
							resolve({});
						})
						// if the promise is rejected with an error
						.catch((error) => {
							// reject this promise with the error
							reject(error);
						});
				})
				// if the promise is rejected with an error
				.catch((allMessagesError) => {
					// reject this promise with the error
					reject({ allMessagesError });
				});
		}),


	TempReturnS3FileSystem: (bucketName) =>
		new S3FS(bucketName, module.exports.TempReturnS3Options()),

	TempReturnS3Options: () => ({
		region: 'us-east-1',
		accessKeyId: 'AKIAVAMR4WIEZRKVZY7W',
		secretAccessKey: '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',
	}),
	// ---------------------


	ReturnS3FileSystem: (bucketName) => new S3FS(bucketName, module.exports.ReturnS3Options()),

	ReturnS3Options: () => ({
		region: 'us-east-1',
		accessKeyId: process.env.authMOSAPISLSAdminAccessKeyID,
		secretAccessKey: process.env.authMOSAPISLSAdminSecretAccessKey,
	}),

	ConvertImage: (messageID, fileName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up promise container vars
			const S3FileSystem = module.exports.ReturnS3FileSystem('mos-api-misc-storage');
			// extract base file name
			const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
			// construct file paths
			const readFilePath = `/hub-message-assets/incoming/${messageID}/${fileName}`;
			const writeFilePath = `/hub-message-assets/formatted/${messageID}/${baseFileName}.jpg`;
			// get a promise to read the file
			S3FileSystem.readFile(readFilePath)
				// if the promise is resolved with a result
				.then((readResult) => {
					// get a promise to reformat the image
					sharp(readResult.Body)
						.resize(600, null)
						.toFormat('jpg')
						.jpeg({
							quality: 80,
						})
						.toBuffer()
						// if the promise is resolved with a result
						.then((formattingResult) => {
							// get a promise to 
							S3FileSystem.writeFile(writeFilePath, formattingResult, { ACL: 'public-read' })
								// if the promise is resolved with a result
								.then((writingResult) => {
									// get a promise to 
									S3FileSystem.unlink(
										`/hub-message-assets/incoming/${messageID}/${fileName}`,
									)
										// if the promise is resolved with a result
										.then((removalResult) => {
											// then resolve this promise with earlier result
											resolve(writeFilePath);
										})
										// if the promise is rejected with an error
										.catch((removalError) => {
											// reject this promise with the error
											reject(removalError);
										});
								})
								// if the promise is rejected with an error
								.catch((writingError) => {
									// reject this promise with the error
									reject(writingError);
								});
						})
						// if the promise is rejected with an error
						.catch((formattingError) => {
							// reject this promise with the error
							reject(formattingError);
						});
				})
				// if the promise is rejected with an error
				.catch((readError) => {
					// reject this promise with the error
					reject(readError);
				});
		}),

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	/**
	 * @name HandleSettingsRequest
	 * @function
	 * @async
	 * @description Handle request for settings.
	 */

	HandleSettingsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.ReturnHubMessagesSettings()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((settingsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: settingsError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleMessagesRequest
	 * @function
	 * @async
	 * @description Handle request for messages.
	 */

	HandleMessagesRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.ReturnSpecifiedMessages(
						event.queryStringParameters,
					)
						// if the promise is resolved with a result
						.then((messagesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: messagesResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((messagesError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: messagesError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleAddMessageRequest
	 * @function
	 * @async
	 * @description Handle request to add message. Message object is in event.body.
	 */

	HandleAddMessageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.AddMessage(
						event.body,
					)
						// if the promise is resolved with a result
						.then((addMessageResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: addMessageResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((addMessageError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: addMessageError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleUpdateMessageRequest
	 * @function
	 * @async
	 * @description Handle request to update message. Message object is in event.body.
	 */

	HandleUpdateMessageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.UpdateMessage(
						event.body,
					)
						// if the promise is resolved with a result
						.then((updateMessageResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: updateMessageResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((updateMessageError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: updateMessageError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleNextMessageIDRequest
	 * @function
	 * @async
	 * @description Handle request for the next message ID.
	 */

	HandleNextMessageIDRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					module.exports.ReturnNextMessageIDAndIterate()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((settingsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: settingsError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),

	/**
	 * @name HandleImageFormattingRequest
	 * @function
	 * @async
	 * @description Handle request to format a message's images.
	 */

	HandleImageFormattingRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					const eventBodyCopy =
						Utilities.ReturnUniqueObjectGivenAnyValue(event.body);
					// const eventBodyCopy =
					// 	Utilities.ReturnUniqueObjectGivenAnyValue(eventBody);
					const { messageID } = eventBodyCopy;
					const S3FileSystem = module.exports.ReturnS3FileSystem('mos-api-misc-storage');
					S3FileSystem.readdir(`/hub-message-assets/incoming/${messageID}`)
						// if the promise is resolved with a result
						.then((readDirectoryResult) => {
							const fileProcessingPromises = [];
							// for each file in the directory
							readDirectoryResult.forEach((fileName, fileIndex) => {
								fileProcessingPromises.push(
									module.exports.ConvertImage(
										messageID,
										fileName,
									),
								);
							});
							// get a promise to 
							Promise.all(fileProcessingPromises)
								// if the promise is resolved with a result
								.then((fileProcessingResults) => {
									// send indicative response
									Response.HandleResponse({
										statusCode: 200,
										responder: resolve,
										content: {
											payload: fileProcessingResults,
											event,
											context,
										},
									});
								})
								// if the promise is rejected with an error
								.catch((fileProcessingError) => {
									// send indicative response
									Response.HandleResponse({
										statusCode: 500,
										responder: resolve,
										content: {
											error: fileProcessingError,
											event,
											context,
										},
									});
								});
						})
						// if the promise is rejected with an error
						.catch((readError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: readError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),


	/**
	 * @name HandleDeleteImageRequest
	 * @function
	 * @async
	 * @description Handle request to delete an image.
	 */

	HandleDeleteImageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					const eventBodyCopy =
						Utilities.ReturnUniqueObjectGivenAnyValue(event.body);
					const { messageID } = eventBodyCopy;
					const { fileName } = eventBodyCopy;
					const S3FileSystem = module.exports.ReturnS3FileSystem('mos-api-misc-storage');
					// get a promise to 
					S3FileSystem.unlink(
						`/hub-message-assets/formatted/${messageID}/${fileName}`,
					)
						// if the promise is resolved with a result
						.then((removalResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: removalResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((removalError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 401,
								responder: resolve,
								content: {
									error: removalError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							error: accessError,
							event,
							context,
						},
					});
				});
		}),


};
