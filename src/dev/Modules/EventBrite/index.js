/**
 * @name EventBrite
 * @service
 * @description Query the EventBrite API
 */

const axios = require('axios');

module.exports = {

	/**
	 * @name ReturnEventBriteQueryConfig
	 * @function
	 * @async
	 * @description Return URI and options for get query to EventBrite API
	 * @param page - Which page to return
	 * @param organizationID - Organization ID for which to get events
	 */

	ReturnEventBriteQueryConfig: (page, organizationToken) => {

		return {
			uri: 'https://service4.ultipro.com/personnel/v1/employee-changes',
			options: {
				headers: {
					Authorization: `Basic ${}`,
					'US-Customer-Api-Key': process.env.upApiKey,
					'Content-Type': 'application/json',
				},
				params: {
					page,
					per_page: 200,
					startDate: '1900-12-31T00:00:00Z',
					endDate: '2199-12-31T00:00:00Z',
				},
				timeout: 15000,
			},
		};
	},

	/**
	 * @name ReturnOnePageOfEmployeesFromUltiPro
	 * @function
	 * @async
	 * @description Return one page of employees from the UltiPro EmployeeChanges API. 
	 * This is the one point of actual contact with the UltiPro EmployeeChanges API.
	 * @param upApiKey - Environment variable,
	 * stored in AWS Systems Manager, Parameter store
	 * @param upEmployeeChangesPass - Environment variable,
	 * stored in AWS Systems Manager, Parameter store
	 * @param upEmployeeChangesUser - Environment variable,
	 * stored in AWS Systems Manager, Parameter store
	 * @param page - Which page to return
	 */

	ReturnOnePageOfEventsFromEventBrite: (page) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get URI and options
			const config = module.exports.ReturnUltiProEmployeeChangesQueryConfig(page);
			// get a promise to retrieve one page of employees
			axios.get(config.uri, config.options)
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve({
							error: false,
							onePage: result.data,
						});
					// if status indicates other than success
					} else {
						// create a generic error
						const errorToReport = {
							error: true,
							ultiProError: true,
							ultiProStatus: result.status,
						};
						// reject this promise with the error
						reject(errorToReport);
					}
				})
				// if the promise is rejected with an error, 
				.catch((error) => {
					// create a generic error
					const errorToReport = {
						error: true,
						ultiProError: true,
						ultiProErrorDetails: error,
					};
					// reject this promise with an error
					reject(errorToReport);
				});
		}),

	/**
	 * @name ReturnAllEmployeesFromUltiPro
	 * @function
	 * @async
	 * @description Return all employees from the UltiPro EmployeeChanges API. 
	 * I.e., Return all of the pages.
	 */

	RecursivelyGetAllPagesOfEventsFromEventBrite: (page, allEmployees) => {
		// define function to handle result of async call
		const HandleResult = (result) => {
			// if result contains no employees
			if (result.onePage.length === 0) {
				return allEmployees;
			} 
			// eslint-disable-next-line no-param-reassign
			allEmployees = [...allEmployees, ...result.onePage];
			return module.exports.RecursivelyGetAllPagesOfEmployeesFromUltiPro(page + 1, allEmployees);
		};
		return module.exports.ReturnOnePageOfEmployeesFromUltiPro(page)
			.then(HandleResult);
	},

	ReturnAllEventsFromEventBrite: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set up var to hold all employees
			const allEmployees = [];
			// get a promise to get all employees from UltiPro
			module.exports.RecursivelyGetAllPagesOfEmployeesFromUltiPro(1, allEmployees)
				// if the promise is resolved with a result
				.then((result) => {
					// then resolve this promise with the result
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),
};
