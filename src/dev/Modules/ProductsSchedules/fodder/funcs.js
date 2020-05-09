/**
 * @name ReturnStandardHoursFromDrupal
 * @function
 * @async
 * @description Return standard hours data from the mos.org Drupal API
 */

/* ReturnStandardHoursFromDrupal: () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve
		axios.get('https://www.mos.org/views-api/hours-standard')
			// if the promise is resolved
			.then((result) => {
				// if status indicates success
				if (result.status === 200) {
					// set up container object for all the days
					const standardHoursByDays = {};
					// for each day in received array of days
					result.data.days.forEach((dayObject) => {
						// add a day with times to container object
						standardHoursByDays[dayObject.name] = {
							openingTime: dayObject.openingTime,
							closingTime: dayObject.closingTime,
						};
					});
					// resolve this promise with the container object
					resolve({
						error: false,
						standardHoursByDays,
					});
					// if status indicates other than success
				} else {
					// create a generic error
					const errorToReport = {
						error: true,
						drupalStatus: result.status,
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
					errorDetails: error,
				};
				// reject this promise with an error
				reject(errorToReport);
			});
	}), */


/**
 * @name ReturnVenuesFromDrupal
 * @function
 * @async
 * @description Return standard hours data from the mos.org Drupal API
 */

/* ReturnVenuesFromDrupal: () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve
		axios.get('https://www.mos.org/views-api/venues')
			// if the promise is resolved
			.then((result) => {
				// if status indicates success
				if (result.status === 200) {
					// resolve this promise with the list items
					resolve({
						error: false,
						venues: result.data.venues,
					});
					// if status indicates other than success
				} else {
					// create a generic error
					const errorToReport = {
						error: true,
						drupalStatus: result.status,
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
					errorDetails: error,
				};
				// reject this promise with an error
				reject(errorToReport);
			});
	}), */


/**
 * @name ReturnChannelsFromDrupal
 * @function
 * @async
 * @description Return standard hours data from the mos.org Drupal API
 */

/* ReturnChannelsFromDrupal: () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve
		axios.get('https://www.mos.org/views-api/channels')
			// if the promise is resolved
			.then((result) => {
				// if status indicates success
				if (result.status === 200) {
					// resolve this promise with the list items
					resolve({
						error: false,
						channels: result.data.channels,
					});
					// if status indicates other than success
				} else {
					// create a generic error
					const errorToReport = {
						error: true,
						drupalStatus: result.status,
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
					errorDetails: error,
				};
				// reject this promise with an error
				reject(errorToReport);
			});
	}), */


/**
 * @name ReturnVenuesFromDrupal
 * @function
 * @async
 * @description Return standard hours data from the mos.org Drupal API
 */

/* ReturnScheduledNodesFromDrupal: () =>
	// return a new promise
	new Promise((resolve, reject) => {
		// get a promise to retrieve
		axios.get('https://www.mos.org/views-api/scheduled-nodes')
			// if the promise is resolved
			.then((result) => {
				// if status indicates success
				if (result.status === 200) {
					// resolve this promise with the list items
					resolve({
						error: false,
						nodes: result.data.nodes,
					});
					// if status indicates other than success
				} else {
					// create a generic error
					const errorToReport = {
						error: true,
						drupalStatus: result.status,
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
					errorDetails: error,
				};
				// reject this promise with an error
				reject(errorToReport);
			});
	}), */
