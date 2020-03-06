/**
 * @name XXX
 * @api
 * @description XXX
 */

const Access = require('access');
// const DataQueries = require('data-queries');
const Response = require('response');

/**
 * @name XXX
 * @function
 * @async
 * @description XXX
 */

module.exports = {
	
	XXXXX: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				XXXXXXXXXXX.ReturnHealthWhitelistedDomains,
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

};
