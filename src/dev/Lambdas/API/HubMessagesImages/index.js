/**
 * @name Hub Messages
 * @api
 * @description Handles all Hub Messages-related requests.
 */

const Access = require('access');
const Response = require('response');
const Utilities = require('utilities');
const HubMessages = require('hub-messages');
const Files = require('files');


/**
 * @typedef {import('../../../TypeDefs/HubMessage').HubMessage} HubMessage
 */

module.exports = {

	/**
	 * @name HandleImageFormattingRequest
	 * @function
	 * @async
	 * @description Handle request to format a message's images.
	 */

	HandleImageFormattingRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			/* 
				utilities
				Files
			*/
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
					const S3FileSystem = Files.ReturnS3FileSystem('mos-api-misc-storage');
					S3FileSystem.readdir(`/hub-message-assets/incoming/${messageID}`)
						// if the promise is resolved with a result
						.then((readDirectoryResult) => {
							const fileProcessingPromises = [];
							// for each file in the directory
							readDirectoryResult.forEach((fileName, fileIndex) => {
								fileProcessingPromises.push(
									Files.ConvertImage(
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
					const S3FileSystem = Files.ReturnS3FileSystem('mos-api-misc-storage');
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
