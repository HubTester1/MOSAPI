/**
 * @name XXX
 * @api
 * @description XXX
 */

const Access = require('access');
const HubLists = require('hub-lists');
const Response = require('response');

module.exports = {

	/**
	 * @name HandleSettingsRequest
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
				HubLists.ReturnHubListsWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubLists.ReturnHubListsSettings()
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

	/**
	 * @name HandleListRequest
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleListRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubLists.ReturnHubListsWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubLists.ReturnList(event.body)
						// if the promise is resolved with a result
						.then((listResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: listResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((listError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: listError,
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
	 * @name HandleListItemsRequest
	 * @function
	 * @async
	 * @description XXX
	 * 
	 * 
	 * 
	 * NOTE: Any field (column) referenced in a filter string must be an indexed column. 
	 * There's a way to get around this, but Microsoft says it's not reliable.
	 * 
	 * Fields (columns) can actually have multiple names. Some columns in older lists
	 * have internal names that differ from the names displayed in the browser. If you 
	 * think this might be the sources of a problem, use a CAML query builder tool to 
	 * get deeper info about individual fields.
	 */

	HandleListItemsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubLists.ReturnHubListsWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubLists.ReturnListItems(event.body)
						// if the promise is resolved with a result
						.then((itemsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: itemsResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((itemsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: itemsError,
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
