/**
 * @name UltiPro
 * @service
 * @description Query the UltiPro EmployeeChangesAPI
 */

const axios = require('axios');

module.exports = {

	/**
	 * @name ReturnUltiProEmployeeChangesQueryConfig
	 * @function
	 * @async
	 * @description Return URI and options for get query to UltiPro EmployeeChanges API
	 * @param page - Which page to return
	 */

	ReturnUltiProEmployeeChangesQueryConfig: (page) => {
		const buffer = Buffer.from(
			`${process.env.upEmployeeChangesUser}:${process.env.upEmployeeChangesPass}`,
			'ascii',
		);
		const basicAuthToken = `Basic ${buffer.toString('base64')}`;
		
		return {
			uri: 'https://service4.ultipro.com/personnel/v1/employee-changes',
			options: {
				headers: {
					Authorization: basicAuthToken,
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

	ReturnOnePageOfEmployeesFromUltiPro: (page) =>
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

	RecursivelyGetAllPagesOfEmployeesFromUltiPro: (page, allEmployees) => {
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

		/* // get a promise to retrieve one page of employees
			module.exports.ReturnOnePageOfEmployeesFromUltiPro(page)
				// if the promise is resolved
				.then((result) => {
					// console.log(`found ${result.onePage.length} employees`);
					// if a page of employees was returned
					if (result.onePage.length > 0) {
						// add the page of employees to allEmployees
						// eslint-disable-next-line no-param-reassign
						allEmployees = [...allEmployees, ...result.onePage];
						// make another attempt
						module.exports.RecursivelyGetAllPagesOfEmployeesFromUltiPro(page + 1, allEmployees);
					// if we've reached the end of the pages
					} else {
						console.log(`------------ gonna resolve with ${allEmployees.length} employees`);
						// resolve this promise with all of the employees
						resolve({
							error: false,
							allEmployees,
						});
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
		}) */
	},

	ReturnAllEmployeesFromUltiPro: () =>
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
