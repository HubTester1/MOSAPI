/**
 * @name S3
 * @service
 * @description Performs all S3-related operations.
 */

const S3FS = require('s3fs');
const axios = require('axios');

/**
 * @typedef {import('../../../TypeDefs/HubMessage').HubMessage} HubMessage
 */

module.exports = {

	ReturnS3FileSystemOverHTTP: (bucketName) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to 
			module.exports.ReturnS3OptionsOverHTTP()
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(new S3FS(bucketName, result));
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnS3OptionsOverHTTP: () => 
		// return a new promise
		new Promise((resolve, reject) => {
			console.log('gonna get creds');
			// get a promise to get aws credentials
			axios.get(
				'https://xmmymt42ql.execute-api.us-east-1.amazonaws.com/dev/access/aws-credentials',
				{
					headers: {
						Authorization: 'Bearer ========================================================================================================================================',
					},
				},
			)
				// if the promise is resolved with a result
				.then((result) => {
					console.log('credentials result');
					console.log(result);
					// resolve this promise with a constructed options object
					resolve({
						region: 'us-east-1',
						accessKeyId: result.payload.authMOSAPISLSAdminAccessKeyID,
						secretAccessKey: result.payload.authMOSAPISLSAdminSecretAccessKey,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					console.log('creds error');
					console.log(error);
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnS3FileSystemLocally: (bucketName) => 
		new S3FS(bucketName, module.exports.ReturnS3OptionsLocally()),

	ReturnS3OptionsLocally: () => ({
		region: 'us-east-1',
		accessKeyId: process.env.authMOSAPISLSAdminAccessKeyID,
		secretAccessKey: process.env.authMOSAPISLSAdminSecretAccessKey,
	}),

};
