/**
 * @name Files
 * @service
 * @description XXX
 */

const S3FS = require('s3fs');
const sharp = require('sharp');

module.exports = {

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */


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
	

	ReturnS3FileSystem: (bucketName) =>
		new S3FS(bucketName, module.exports.ReturnS3Options()),

	ReturnS3Options: () => ({
		region: 'us-east-1',
		accessKeyId: process.env.authMOSAPISLSAdminAccessKeyID,
		secretAccessKey: process.env.authMOSAPISLSAdminSecretAccessKey,
	}),

};
