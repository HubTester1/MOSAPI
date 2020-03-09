/**
 * @name XXX
 * @api
 * @description XXX
 */

const Access = require('access');
const Files = require('files');
const Response = require('response');

module.exports = {

	/**
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleSettingsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					Files.ReturnFilesSettings()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs[0],
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((settingsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: settingsError,
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleCreateFolderRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					Files.CreateFolder(event.body)
						// if the promise is resolved with a result
						.then((creationResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: creationResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((creationError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: creationError,
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleCreateFileRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					Files.CreateFile(event.body)
						// if the promise is resolved with a result
						.then((creationResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: creationResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((creationError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: creationError,
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

	/* XXXXX: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					XXX()
						// if the promise is resolved with a result
						.then((otherResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: otherResult.docs[0],
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((otherError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: otherError,
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

	XXXXX: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					XXX()
						// if the promise is resolved with a result
						.then((otherResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: otherResult.docs[0],
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((otherError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: otherError,
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
		}), */

};
