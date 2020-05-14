/**
 * @name Products and Schedules
 * @api
 * @description Handles all cron jobs related to Museum products, hours, and operations schedules.
 */

const Access = require('access');
const ProductsSchedules = require('products-schedules');
const Response = require('response');

module.exports = {

	/**
	 * @name HandleProcessEmailQueue
	 * @function
	 * @async
	 * @description Handle cron job command to process email queue.
	 */

	HandleReplaceScheduleEvent: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				ProductsSchedules.ReturnProductsSchedulesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to process email queue
					ProductsSchedules.ReplaceMOSScheduleData()
						// if the promise is resolved with a result
						.then((replacementResult) => {
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
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							accessError,
							event,
							context,
						},
					});
				});
		}),

	HandleUpdateScheduleEvent: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				ProductsSchedules.ReturnProductsSchedulesWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					// get a promise to process email queue
					ProductsSchedules.ReplaceMOSScheduleData()
						// if the promise is resolved with a result
						.then((replacementResult) => {
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
					// send indicative response
					Response.HandleResponse({
						statusCode: 401,
						responder: resolve,
						content: {
							accessError,
							event,
							context,
						},
					});
				});
		}),
};
