/**
 * @name Images
 * @service
 * @description XXX
 */

const sharp = require('sharp');

module.exports = {

	/**
	 * @name ResizeImage
	 * @function
	 * @description XXX
	//  * @param {XXX} XXX
	 */

	ResizeImage: (imageData, width, height) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to reformat the image
			sharp(imageData)
				.resize(width, height)
				.toBuffer()
				// if the promise is resolved with a result
				.then((resizedBuffer) => {
					resolve(resizedBuffer);
				})
				// if the promise is rejected with an error
				.catch((resizingError) => {
					// reject this promise with the error
					reject(resizingError);
				});
		}),

	/**
	 * @name ConvertImageToJpeg
	 * @function
	 * @description XXX
	//  * @param {XXX} XXX
	 */

	ConvertImageToJpeg: (imageData, jpegQuality) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to reformat the image
			sharp(imageData)
				.toFormat('jpg')
				.jpeg({
					quality: jpegQuality,
				})
				.toBuffer()
				// if the promise is resolved with a result
				.then((jpegBuffer) => {
					resolve(jpegBuffer);
				})
				// if the promise is rejected with an error
				.catch((jpegError) => {
					// reject this promise with the error
					reject(jpegError);
				});
		}),


};
