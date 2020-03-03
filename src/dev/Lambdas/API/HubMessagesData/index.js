/**
 * @name Hub Messages
 * @api
 * @description Handles all Hub Messages-related requests.
 */

const Access = require('access');
const Response = require('response');
const HubMessages = require('hub-messages');

/**
 * @typedef {import('../../../TypeDefs/HubMessage').HubMessage} HubMessage
 */

module.exports = {

	/**
	 * @name HandleSettingsRequest
	 * @function
	 * @async
	 * @description Handle request for settings.
	 */

	HandleSettingsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.ReturnHubMessagesSettings()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs,
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
	 * @name HandleMessagesRequest
	 * @function
	 * @async
	 * @description Handle request for messages.
	 */

	HandleMessagesRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.ReturnSpecifiedMessages(
						event.queryStringParameters,
					)
						// if the promise is resolved with a result
						.then((messagesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: messagesResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((messagesError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: messagesError,
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
	 * @name HandleAddMessageRequest
	 * @function
	 * @async
	 * @description Handle request to add message. Message object is in event.body.
	 */

	HandleAddMessageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.AddMessage(
						event.body,
					)
						// if the promise is resolved with a result
						.then((addMessageResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: addMessageResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((addMessageError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: addMessageError,
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
	 * @name HandleUpdateMessageRequest
	 * @function
	 * @async
	 * @description Handle request to update message. Message object is in event.body.
	 */

	HandleUpdateMessageRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.UpdateMessage(
						event.body,
					)
						// if the promise is resolved with a result
						.then((updateMessageResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: updateMessageResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((updateMessageError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: updateMessageError,
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
	 * @name HandleNextMessageIDRequest
	 * @function
	 * @async
	 * @description Handle request for the next message ID.
	 */

	HandleNextMessageIDRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubMessages.ReturnHubMessagesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					HubMessages.ReturnNextMessageIDAndIterate()
						// if the promise is resolved with a result
						.then((settingsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: settingsResult.docs,
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

};
