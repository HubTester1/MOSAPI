/**
 * @name XXX
 * @api
 * @description XXX
 */

const Access = require('access');
const HubSites = require('hub-sites');
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
				HubSites.ReturnHubSitesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubSites.ReturnHubSitesSettings()
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

	HandleReturnSiteRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubSites.ReturnHubSitesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubSites.ReturnSite(event.body)
						// if the promise is resolved with a result
						.then((siteResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: siteResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((siteError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: siteError,
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

	HandleReturnAllDrivesRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubSites.ReturnHubSitesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubSites.ReturnAllDrives(event.body)
						// if the promise is resolved with a result
						.then((drivesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: drivesResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((drivesError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: drivesError,
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

	HandleReturnAllListsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				HubSites.ReturnHubSitesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					HubSites.ReturnAllLists(event.body)
						// if the promise is resolved with a result
						.then((listsResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: listsResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((listsError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: listsError,
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
