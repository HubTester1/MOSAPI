/**
 * @name Health
 * @api
 * @description Handles all health-related requests.
 */

const Image3 = require('image-3');
const Response = require('response');
const Utilities = require('utilities');

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
			const eventBodyCopy =
				Utilities.ReturnUniqueObjectGivenAnyValue(event.body);
			// const eventBodyCopy =
			// 	Utilities.ReturnUniqueObjectGivenAnyValue(eventBody);
			const { messageID } = eventBodyCopy;
			const S3FileSystem = Image3.ReturnS3FileSystem('mos-api-misc-storage');
			S3FileSystem.readdir(`/hub-message-assets/incoming/${messageID}`)
				// if the promise is resolved with a result
				.then((readDirectoryResult) => {
					const fileProcessingPromises = [];
					// for each file in the directory
					readDirectoryResult.forEach((fileName, fileIndex) => {
						fileProcessingPromises.push(
							Image3.ConvertImage(
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
		}),

};
