
// ----- PULL IN MODULES

// const fse = require('fs-extra');
const formidable = require('formidable');
const easyimage = require('easyimage');


const nesoDBQueries = require('./nesoDBQueries');
// const nesoErrors = require('./nesoErrors');

// ----- DEFINE IMAGES FUNCTIONS

module.exports = {

	ReturnImagesSettingsData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('imagesSettings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),

	ReturnImagesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnImagesSettingsData()
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
		}),
	
	ReturnImageInfo: path => 
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get image info
			easyimage.info(path)
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((infoResult) => { resolve(infoResult); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}),
	
	ConvertToJPGIfNeeded: imageInfo =>
		// return a new promise
		new Promise((resolve, reject) => {
			// if this image is a PNG
			if (imageInfo.type === 'png') {
				// get a promise to create a JPG at the destination
				easyimage.convert({
					src: imageInfo.path,
					dst: `${imageInfo.path}_converted`,
				})
					// if the promise was resolved
					.then(() => {
						// resolve this promise with the result
						resolve({
							error: false,
							result: `${imageInfo.path}_converted`,
							resultType: 'jpg',
						});
					})
					// if the promise was rejected with an error, reject this promise with the error
					.catch((error) => { reject(error); });
			// if this image is NOT a PNG
			} else {
				// resolve this promise with the original info
				resolve({
					error: false,
					result: imageInfo.path,
					resultType: imageInfo.type,
				});
			}
		}),


	ReceiveImage: req =>
		// return a new promise
		new Promise((resolve, reject) => {
			// console.log('---------ReceiveImage---------');
			const form = new formidable.IncomingForm();
			form.parse(req, (err, fields, files) => {
				// console.log('messageID');
				// console.log(fields.messageID);
				// console.log('image0 path');
				// console.log(files.image0.path);
			});
			if (req) {
				resolve({
					req,
				});
			} else {
				reject({
					error: true,
				});
			}
		}),

	ResizeImages: imagesArray =>
		// note that this promise will always be resolved, never rejected; 
		// 		however, errors may be true or false
		// return a new promise
		new Promise((resolve, reject) => {
			const imageResizePromises = [];
			imagesArray.forEach((image) => {
				imageResizePromises.push(module.exports.ResizeImage(image));
			});
			Promise.all(imageResizePromises)
				.then((imageResizeResults) => {
					resolve({
						error: 'check',
						imageResizeResults,
					});
				});
		}),

	ResizeImage: incomingImage =>
		// note that this promise will always be resolved, never rejected; 
		// 		however, errors may be true or false
		// return a new promise
		new Promise((resolve, reject) => {
			// either width or height is required
			if (
				incomingImage.source && 
				incomingImage.destination && 
				(incomingImage.width || incomingImage.height)
			) {
				// construct options object from params
				const resizeOptions = {
					src: incomingImage.source,
					dst: incomingImage.destination,
				};
				if (incomingImage.width) {
					resizeOptions.width = incomingImage.width;
				}
				if (incomingImage.height) {
					resizeOptions.height = incomingImage.height;
				}
				// get a promise to resize the image
				easyimage.resize(resizeOptions)
					// if the promise was resolved with the result
					.then((result) => {
						// resolve this promise with the resule
						resolve({
							error: false,
							imageMagickResult: result,
						});
					})
					// if the promise was rejected with an error
					.catch((error) => {
						// reject this promise with the error
						resolve({
							error: true,
							imageMagickError: error,
						});
					});
			// if neither width or height was supplied
			} else {
				// reject this promise with an error
				resolve({
					error: true,
					paramError: 'image object does not contain needed properties',
				});
			}
		}),
};
