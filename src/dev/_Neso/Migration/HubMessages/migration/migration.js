/* eslint-disable max-len */

/* 

	===========
	MIGRATE MESSAGE DATA
	===========
	-from /MOSAPI/
	lambda-local -l src/dev/Lambdas/API/HubMessages/migration.js -h ConvertAndStoreAllMessagesData -e src/dev/Lambdas/API/HubMessages/testing/get-messages-event.js --envfile .env --timeout 30000

	===========
	MIGRATE MESSAGE IMAGES
	===========
	-from /MOSAPI/
	lambda-local -l src/dev/Lambdas/API/HubMessages/migration.js -h ReadAndStoreAllMessageImages -e src/dev/Lambdas/API/HubMessages/testing/get-messages-event.js --envfile .env --timeout 30000

 */

const DataQueries = require('data-queries');
const Utilities = require('utilities');
const S3FS = require('s3fs');
const axios = require('axios');
const uuid = require('uuid');
const dotenv = require('dotenv');

dotenv.config({ path: '../../../.env' });

module.exports = {

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
						Utilities.ReturnResourceExistsAtURI(
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
				});
		}),

	/* ReadAndStoreOneMessageImage: async (messageID, fileName, oldURL) => {
		// set up promise container vars
		const S3FileSystem = module.exports.ReturnS3FileSystem('mos-api-misc-storage');
		const writeFilePath = `/hub-message-assets/formatted/${messageID}/${fileName}.jpg`;
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
	}, */

	ReadAndStoreOneMessageImage: (messageID, fileName, oldURL) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			axios({
				method: 'get',
				url: oldURL,
				responseType: 'stream',
			})
				// if the promise is resolved with a result
				.then((result) => {
					const S3FileSystem = module.exports.ReturnS3FileSystem('mos-api-misc-storage');
					const writeFilePath = `/hub-message-assets/formatted/${messageID}/${fileName}.jpg`;
					const writer = S3FileSystem.createWriteStream(writeFilePath, { ACL: 'public-read' });
					writer.on('finish', resolve);
					writer.on('error', resolve);
					result.data.pipe(writer);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnS3FileSystem: (bucketName) =>
		new S3FS(bucketName, module.exports.ReturnS3Options()),

	ReturnS3Options: () => ({
		region: 'us-east-1',
		accessKeyId: process.env.authMOSAPISLSAdminAccessKeyID,
		secretAccessKey: process.env.authMOSAPISLSAdminSecretAccessKey,
	}),

	AttemptToReadAndStoreOneMessageImage: (messageID, fileName, oldURL) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to determine whether or not image exists
			Utilities.ReturnResourceExistsAtURI(oldURL)
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

};
