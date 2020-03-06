
// ----- PULL IN MODULES

const moment = require('moment');
const fse = require('fs-extra');
const formidable = require('formidable');
const shortid = require('shortid');
const nesoDBConnection = require('./nesoDBConnection');
const nesoErrors = require('./nesoErrors');
const nesoDBQueries = require('./nesoDBQueries');
const nesoImages = require('./nesoImages');
const nesoUtilities = require('./nesoUtilities');

// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	ReturnHcMessagesSettingsData: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcMessagesSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHcMessagesNextMessageIDAndIterate: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the hcMessagesSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hcMessagesSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the ID
					resolve({
						error: false,
						docs: { nextMessageID: result.docs[0].nextMessageID },
					});
					// iterate the value in the db for next time
					module.exports.IterateHcMessagesNextMessageID(result.docs[0]);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	IterateHcMessagesNextMessageID: (existingSettings) => {
		const newNextMessageID = existingSettings.nextMessageID + 1;
		// get a promise to replace the settings in the hcMessagesSettings document collection
		nesoDBQueries
			.UpdateSpecificFieldInSpecificDocsInCollection('hcMessagesSettings', '_id', existingSettings._id, true, 'nextMessageID', newNextMessageID);
	},
	ReturnHcMessagesWhitelistedDomains: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnHcMessagesSettingsData()
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

	ReturnHcMessages: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// note: sortObject and projectionObject MUST be constructed in the following way;
			// 		attempts to "optimize" the relevant lines result in errors
			const queryObject = {};

			queryObject.messageExpiration = { $gte: new Date() };

			// use nesoDBConnection object to query db
			nesoDBConnection.get('hcMessages')
				.find(queryObject, {}, (error, docs) => {
					// if there was an error
					if (error) {
						// construct a custom error
						const errorToReport = {
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						};
						// add error to Twitter
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
						// if there was NOT an error
					} else {
						// resolve the promise and return the docs
						resolve({
							error: false,
							mongoDBError: false,
							docs,
						});
					}
				});
		}),

	ReturnHcMessagesDescending: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// note: sortObject and projectionObject MUST be constructed in the following way;
			// 		attempts to "optimize" the relevant lines result in errors
			const sortObject = {};
			const projectionObject = {};
			const queryObject = {};

			sortObject.messageModified = -1;

			projectionObject.sort = sortObject;

			queryObject.messageExpiration = { $gte: new Date() };

			// use nesoDBConnection object to query db
			nesoDBConnection.get('hcMessages')
				.find(queryObject, projectionObject, (error, docs) => {
					// if there was an error
					if (error) {
						// construct a custom error
						const errorToReport = {
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						};
						// add error to Twitter
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
					// if there was NOT an error
					} else {
						// move pinned messages to beginning of array
						const messagesWithPinnedFirst = module.exports.ReturnMessagesWithPinnedFirst(docs);
						// resolve the promise and return the docs
						resolve({
							error: false,
							mongoDBError: false,
							docs: messagesWithPinnedFirst,
						});
					}
				});
		}),

	ReturnMessagesWithPinnedFirst: (messages) => {
		// set up container arrays
		const messagesNotPinned = [];
		const messagesPinned = [];
		let allMessages = [];
		// for each message
		messages.forEach((message) => {
			// if this message has a pinnedUntil property and
			// 		the pinnedUntil datetime is in the future
			if (message.pinnedUntil && moment(message.pinnedUntil).isAfter(moment())) {
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

	ReturnHcMessagesDescendingLimit4: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get all messages with pinned messages first
			module.exports.ReturnHcMessagesDescending()
				// if the promise is resolved with the messages, then resolve this promise with the docs
				.then((result) => {
					resolve({
						error: false,
						mongoDBError: false,
						docs: result.docs.slice(0, 4),
					}); 
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	ReturnHcMessagesDescendingWithSpecifiedTag: (name, camlName) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// note: queryObject MUST be constructed in the following way; 
			// 		attempts to "optimize" the next two lines result in errors
			const queryObject = {};
			queryObject.messageTags = [{ name, camlName }];
			queryObject.messageExpiration = { $gte: new Date() };

			// get a promise to retrieve all documents from the hcMessages document collection
			nesoDBQueries.ReturnSpecifiedDocsFromCollectionSorted('hcMessages', queryObject, 'messageModified', 'descending')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ProcessNewMessageImages: (req) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get the form data out of the incoming request
			const form = new formidable.IncomingForm();
			// set the temporary file storage location
			form.uploadDir = 'E:\\tmp';
			// parse the form data
			form.parse(req, (err, fields, files) => {
				// set up container for file processing promises
				const fileProcessingPromises = [];
				// construct base storage path and URI
				const storageBasePath = `${process.env.appRoot}\\public\\images\\hcMessages\\${fields.messageID}\\`;
				const storageBaseURI = `https://neso.mos.org:${process.env.httpsPort}/images/hcMessages/${fields.messageID}/`;
				// create folder for storage, if it doesn't exist
				if (!fse.existsSync(storageBasePath)) {
					fse.mkdirSync(storageBasePath);
				}
				// get an array of keys in the files object
				const fileKeys = Object.keys(files);
				// for each key in the files object
				fileKeys.forEach((fileKey) => {
					// add to file processing promises container a promise to 
					// 		process one file (from the files object, using this fileKey)
					fileProcessingPromises
						.push(module.exports.ProcessNewMessageImage(files[fileKey], storageBasePath, storageBaseURI));
				});
				// when all file processing promises are resolved
				Promise.all(fileProcessingPromises)
					.then((fileProcessingResults) => {
						// resolve this promise with the file processing results
						resolve({
							error: 'check',
							imageProcessingResults: fileProcessingResults,
						});
					});
			});
		}),

	ProcessNewMessageImage: (incomingFile, storageBasePath, storageBaseURI) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// console.log(incomingFile);
			// get a promise to get info about this image file
			nesoImages.ReturnImageInfo(incomingFile.path)
				// if the promise is resolved with the image info
				.then((imageInfo) => {
					// get a promise to convert to JPG, if needed
					nesoImages.ConvertToJPGIfNeeded(imageInfo)
						// if the promise was resolved with the result
						.then((conversionResult) => {
							// construct base storage path, name, extension
							const storageName = incomingFile.name.replace(/\.[^/.]+$/, '');
							const storageExtension = conversionResult.resultType;
							// get a promise to store resized images
							nesoImages.ResizeImages([
								{
									source: conversionResult.result,
									width: 350,
									destination: `${storageBasePath}${storageName}_350.${storageExtension}`,
								}, {
									source: conversionResult.result,
									width: 600,
									destination: `${storageBasePath}${storageName}_600.${storageExtension}`,
								},
							])
								// when the promise was resolved with the result, which will
								// 		always be the case; no promise rejection here
								.then((resizeResults) => {
									// extract the results
									const { imageResizeResults } = resizeResults;
									// set flag indicating that none of the resizes failed
									let onePlusResizesFailed = false;
									// iterate over each resize result
									imageResizeResults.forEach((imageResizeResult) => {
										// if this result was an error, set flag to indicate 1+ errors
										if (imageResizeResult.error) { onePlusResizesFailed = true; }
									});
									// if there were no resize errors
									if (!onePlusResizesFailed) {
										// resolve this promise with a result
										resolve({
											error: false,
											name: storageName,
											urlSmall: `${storageBaseURI}${storageName}_350.${storageExtension}`,
											urlLarge: `${storageBaseURI}${storageName}_600.${storageExtension}`,
											key: shortid.generate(),
										});
									} else {
										// resolve this promise with an error
										resolve({
											error: true,
											imageResizeError: true,
											name: storageName,
											key: shortid.generate(),
										});
									}
								});
						})
						// if the promise was rejected with an error
						.catch((error) => {
							// resolve this promise with an error
							resolve({
								error: true,
								imageConversionError: true,
								errorInfo: error,
								name: incomingFile.name,
								key: shortid.generate(),
							});
						});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// resolve this promise with an error
					resolve({
						error: true,
						imageInfoError: true,
						errorInfo: error,
						name: incomingFile.name,
						key: shortid.generate(),
					});
				});
		}),

	ProcessNewMessage: (incomingMessage) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// preserve function parameter
			const incomingMessageCopy = incomingMessage;
			// weed out some unnecessary image data
			const imageDataToKeep = [];
			incomingMessageCopy.newMessageImages.forEach((imageValue) => {
				imageDataToKeep.push({
					error: false,
					name: imageValue.name,
					key: imageValue.key,
					// size: imageValue.size,
					urlLarge: imageValue.urlLarge,
					urlSmall: imageValue.urlSmall,
				});
			});
			const messageToInsert = {
				messageID: incomingMessageCopy.newMessageID,
				messageTags: incomingMessageCopy.newMessageTags,
				messageSubject: incomingMessageCopy.newMessageSubject,
				messageBody: incomingMessageCopy.newMessageBody,
				messageImages: imageDataToKeep,
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
			nesoDBQueries.InsertDocIntoCollection(messageToInsert, 'hcMessages')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ProcessMessageUpdate: (incomingMessage) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// preserve function parameter
			const incomingMessageCopy = incomingMessage;
			// weed out some unnecessary image data
			const imageDataToKeep = [];
			incomingMessageCopy.newMessageImages.forEach((imageValue) => {
				imageDataToKeep.push({
					error: false,
					name: imageValue.name,
					key: imageValue.key,
					urlLarge: imageValue.urlLarge,
					urlSmall: imageValue.urlSmall,
				});
			});
			const messagePropsToSet = [
				{ key: 'messageTags', value: incomingMessageCopy.newMessageTags },
				{ key: 'messageSubject', value: incomingMessageCopy.newMessageSubject },
				{ key: 'messageBody', value: incomingMessageCopy.newMessageBody },
				{ key: 'messageImages', value: imageDataToKeep },
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
			nesoDBQueries
				.UpdateSpecificFieldsInSpecificDocsInCollection('hcMessages', 'messageID', incomingMessageCopy.newMessageID, false, messagePropsToSet)
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

};
