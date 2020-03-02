
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
	 * @name AddImages
	 * @function
	 * @async
	 * @description Resize images, convert to JPG (if necessary), store, return data.
	 */

	ReturnFileTextContentAsBinary: (incomingFileContent) => incomingFileContent.split('').map((char) => char.charCodeAt(0).toString(2)).join(' '),


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
						messageCreated: new Date(oldMessage.messageCreated),
						messageCreator: new Date(oldMessage.messageCreator),
						messageModified: new Date(oldMessage.messageModified),
						messageExpiration: new Date(oldMessage.messageExpiration),
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
		const writer = S3FileSystem.createWriteStream(writeFilePath, { ACL: 'public-read' });
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
												`${imageObject.name}.jpg`,
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
		accessKeyId: 'AKIAVAMR4WIEUGDIZUD7',
		secretAccessKey: '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',
	}),
	/* 
	ReadAndStoreOneMessageImage: (messageID, fileName, oldURL) =>
		// return a new promise
		new Promise((resolve, reject) => {
			if (module.exports.ReturnURLExists(oldURL)) {
				// set up promise container vars
				const S3FileSystem = module.exports.TempReturnS3FileSystem('mos-api-misc-storage');
				const writeFilePath = `/hub-message-assets/formatted/${messageID}/${fileName}`;
				const writer = S3FileSystem.createWriteStream(writeFilePath);
				writer.on('finish', resolve);
				writer.on('error', resolve);

				// get a promise to
				axios({
					method: 'get',
					url: oldURL,
					responseType: 'stream',
				})
					// if the promise is resolved with a result
					.then((response) => {
						// then resolve this promise with the result
						response.data.pipe(writer);
					})
					// if the promise is rejected with an error
					.catch((error) => {
						// reject this promise with the error
						reject(error);
					});
			} else {
				resolve();
			}
		}),

	
	ReadAndStoreOneMessageImage: async (messageID, fileName, oldURL) => 
		// return a new promise
		new Promise((resolve, reject) => {
			// set up promise container vars
			const S3FileSystem = 
				module.exports.TempReturnS3FileSystem('mos-api-misc-storage');
			const writeFilePath = 
				`/hub-message-assets/formatted/${messageID}/${fileName}`;
			const writer = S3FileSystem.createWriteStream(writeFilePath);
			// get a promise to 
			axios({
				method: 'get',
				url: oldURL,
				responseType: 'stream',
			})
				// if the promise is resolved with a result
				.then((readResponse) => {
					console.log(messageID);
					console.log(readResponse);
					// get a promise to 
					readResponse.data.pipe(writer)
						// if the promise is resolved with a result
						.then((writeResult) => {
							// then resolve this promise with the result
							resolve();
						})
						// if the promise is rejected with an error
						.catch((writeError) => {
							// reject this promise with the error
							reject(writeError);
						});
				})
				// if the promise is rejected with an error
				.catch((readError) => {
					// reject this promise with the error
					reject(readError);
				});
		}), */

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

};
