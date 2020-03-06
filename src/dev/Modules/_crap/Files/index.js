/**
 * @name Files
 * @service
 * @description XXX
 */

const S3FS = require('s3fs');

module.exports = {

	/**
	 * @name XXX
	 * @function
	 * @description XXX
	 * @param {XXX} XXX
	 */

	ReturnS3FileSystem: (bucketName) =>
		new S3FS(bucketName, module.exports.ReturnS3Options()),

	ReturnS3Options: () => ({
		region: 'us-east-1',
		accessKeyId: process.env.authMOSAPISLSAdminAccessKeyID,
		secretAccessKey: process.env.authMOSAPISLSAdminSecretAccessKey,
	}),

};
