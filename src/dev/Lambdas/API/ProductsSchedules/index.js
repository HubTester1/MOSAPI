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
	 * @name HandleSettingsRequest
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleUpdateScheduleRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			console.log('--------------- issued promise');
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				ProductsSchedules.ReturnProductsSchedulesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					console.log('--------------- got access');
					ProductsSchedules.UpdateMOSScheduleData()
						// if the promise is resolved with a result
						.then((updateResult) => {
							console.log('--------------- update result');
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: updateResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((updateError) => {
							console.log('--------------- update error');
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: updateError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					console.log('--------------- denied access');
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
	 * @name HandleSettingsRequest
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleReplaceScheduleRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			console.log('--------------- issued promise');
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				ProductsSchedules.ReturnProductsSchedulesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					console.log('--------------- got access');
					ProductsSchedules.ReplaceMOSScheduleData()
						// if the promise is resolved with a result
						.then((replacementResult) => {
							console.log('--------------- replacement result');
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: replacementResult,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((replacementError) => {
							console.log('--------------- replacement error');
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: replacementError,
									event,
									context,
								},
							});
						});
				})
				// if the promise is rejected with an error
				.catch((accessError) => {
					console.log('--------------- denied access');
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

};
