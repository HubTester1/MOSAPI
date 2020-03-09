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
									payload: settingsResult,
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

	HandleReturnDriveRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					Files.ReturnDrive(event.body)
						// if the promise is resolved with a result
						.then((driveResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: driveResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((driveError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: driveError,
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

	HandleReturnDriveChildrenRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					Files.ReturnDriveChildren(event.body)
						// if the promise is resolved with a result
						.then((childrenResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: childrenResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((childrenError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: childrenError,
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

	HandleReturnDriveChildRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				Files.ReturnFilesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					Files.ReturnDriveChild(event.body)
						// if the promise is resolved with a result
						.then((childResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: childResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((childError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: childError,
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
};
