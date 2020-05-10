/**
 * @name Products and Schedules
 * @api
 * @description Handles all requests related to Museum products, hours, and operations schedules.
 */
const Access = require('access');
const ProductsSchedules = require('products-schedules');
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
				ProductsSchedules.ReturnProductsSchedulesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					ProductsSchedules.ReturnProductsSchedulesSettingsSettingsData()
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
	 * @name HandleReturn365DaysTessituraProductsFromTritonRequest
	 * @function
	 * @async
	 * @description Handle request to 
	 */

	HandleReturnProductsSchedulesRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				ProductsSchedules.ReturnProductsSchedulesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to return health status
					ProductsSchedules.ReturnSpecifiedMOSProductsSchedules(
						event.queryStringParameters,
					)
						// if the promise is resolved with a result
						.then((productsSchedulesResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: productsSchedulesResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((productsSchedulesError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: productsSchedulesError,
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
	 * @name HandleAllPresentFutureEventBriteEventsRequest
	 * @function
	 * @async
	 * @description Handle request to 
	 */
};
