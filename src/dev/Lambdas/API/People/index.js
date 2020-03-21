/**
 * @name People
 * @api
 * @description Handles all people data-related requests.
 */

const Access = require('access');
const People = require('people');
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
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnPeopleSettings()
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
	 * @name XXX
	 * @function
	 * @async
	 * @description XXX
	 */

	HandleReturnAllPeopleRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllPeople()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnOnePersonRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnOnePerson()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllPeopleByDivisionDepartmentRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllPeopleByDivisionDepartment()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllPeopleInDepartmentRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllPeopleInDepartment()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllPeopleInDivisionRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllPeopleInDivision()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllDepartmentsRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllDepartments()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllManagersFlatRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllManagersFlat()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnDirectReportsForOneManagerRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnDirectReportsForOneManager()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllManagersWithFlatDownlineRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllManagersWithFlatDownline()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnAllManagersWithHierarchicalDownlineRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnAllManagersWithHierarchicalDownline()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnOneManagerWithFlatDownlineRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnOneManagerWithFlatDownline()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnOneManagerWithWithHierarchicalDownlineRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnOneManagerWithWithHierarchicalDownline()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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

	HandleReturnFullFlatUplineForOneUserRequest: (event, context) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to check access
			Access.ReturnRequesterCanAccess(
				event,
				People.ReturnPeopleWhitelistedDomains,
			)
				// if the promise is resolved with a result
				.then((accessResult) => {
					People.ReturnFullFlatUplineForOneUser()
						// if the promise is resolved with a result
						.then((queryResult) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 200,
								responder: resolve,
								content: {
									payload: queryResult.docs,
									event,
									context,
								},
							});
						})
						// if the promise is rejected with an error
						.catch((queryError) => {
							// send indicative response
							Response.HandleResponse({
								statusCode: 500,
								responder: resolve,
								content: {
									error: queryError,
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
