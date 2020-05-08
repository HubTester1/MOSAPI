/* eslint-disable no-underscore-dangle */
/**
 * @name Health
 * @service
 * @description Performs all health-related operations.
 */

const axios = require('axios');
const DataQueries = require('data-queries');
const moment = require('moment');
const Utilities = require('utilities');

module.exports = {

	/**
	 * @name ReturnProductsSchedulesSettingsData
	 * @function
	 * @async
	 * @description Return all products and schedules settings 
	 * (all docs from the 'productsSchedulesSettings' collection).
	 */

	ReturnProductsSchedulesSettingsSettingsData: () => 
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve the documents
			DataQueries.ReturnAllDocsFromCollection('productsSchedulesSettings')
				// if the promise is resolved with the docs
				.then((result) => {
					// resolve this promise with the docs
					resolve(result);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),	

	/**
	 * @name ReturnProductsSchedulesWhitelistedDomains
	 * @function
	 * @async
	 * @description Return the setting indicating the domains from which requests are accepted.
	 * Add a domain to this setting in database to allow requests from an additional domain.
	 */
	
	ReturnProductsSchedulesWhitelistedDomains: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve all email settings
			module.exports.ReturnProductsSchedulesSettingsSettingsData()
				// if the promise is resolved with the settings
				.then((settings) => {
					// resolve this promise with the requested setting
					resolve({
						error: settings.error,
						whitelistedDomains: settings.docs[0].whitelistedDomains,
					});
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

	ReturnTritonDataScrubRegularExpression: () => new RegExp(/[\x00-\x1F\x7F-\xFF\uFFFD]/g),
	
	
	/**
	 * @name ReturnTessituraProductsFromTriton
	 * @function
	 * @async
	 * @description Return hours exceptions data from the mos.org Drupal API
	 */

	ReturnTessituraProductsFromTriton: (apiEndpointToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve
			axios.get(`https://triton.mos.org/products/${apiEndpointToken}`)
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// get the regular expression used to clean the data received
						const cleaningRegex = module.exports.ReturnTritonDataScrubRegularExpression();
						// get a cleaned up version of the data using the regular expression
						const cleanedResult = result.data.replace(cleaningRegex, '');
						// get the cleaned result as JSON object
						const productsJSON = JSON.parse(cleanedResult).eventdate;
						// resolve this promise with the list items
						resolve({
							error: false,
							products: productsJSON,
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
		}),


	/**
	 * @name ReturnHoursExceptionsFromDrupal
	 * @function
	 * @async
	 * @description Return hours exceptions data from the mos.org Drupal API
	 */

	ReturnHoursExceptionsFromDrupal: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve
			axios.get('https://www.mos.org/views-api/hours-exceptions')
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve(result.data.exceptions);
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
		}),


	/**
	 * @name ReturnStandardHoursFromDrupal
	 * @function
	 * @async
	 * @description Return standard hours data from the mos.org Drupal API
	 */

	ReturnStandardHoursFromDrupal: () =>
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
		}),


	/**
	 * @name ReturnVenuesFromDrupal
	 * @function
	 * @async
	 * @description Return standard hours data from the mos.org Drupal API
	 */

	ReturnVenuesFromDrupal: () =>
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
		}),


	/**
	 * @name ReturnChannelsFromDrupal
	 * @function
	 * @async
	 * @description Return standard hours data from the mos.org Drupal API
	 */

	ReturnChannelsFromDrupal: () =>
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
		}),


	/**
	 * @name ReturnVenuesFromDrupal
	 * @function
	 * @async
	 * @description Return standard hours data from the mos.org Drupal API
	 */

	ReturnScheduledNodesFromDrupal: () =>
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
		}),

	/**
	 * @name ReturnAllPresentFutureEventBriteEvents
	 * @function
	 * @async
	 * @description Return events from the EventBrite API
	 */

	ReturnMOSSchedule: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get promises to resolve all data
			Promise.all([
				module.exports.ReturnVenuesFromDrupal(),
				module.exports.ReturnChannelsFromDrupal(),
				module.exports.ReturnStandardHoursFromDrupal(),
				module.exports.ReturnHoursExceptionsFromDrupal(),
				module.exports.ReturnScheduledNodesFromDrupal(),
				module.exports.ReturnTessituraProductsFromTriton('productsTodayByDate.json'),
				module.exports.ReturnTessituraProductsFromTriton('products365Days.json'),
				module.exports.ReturnTessituraProductsFromTriton('productsTodayByDate.json'),
				module.exports.ReturnTessituraProductsFromTriton('products365Days.json'),
			])
				// if the promise is resolved with a result
				.then((result) => {
					// get today's date
					const dateToday = moment().format('YYYY-MM-DD');
					// get this moment in time
					const thisMoment = moment();
					// extract data for convenience
					const { venues } = result[0];
					const { channels } = result[1];
					const standardHours = result[2].standardHoursByDays;
					const hoursExceptions = result[3].exceptions;
					const scheduledNodes = result[4].nodes;
					const onsiteProductsToday = result[5].products;
					const onsiteProducts = result[6].products;
					const onlineProductsToday = result[7].products;
					const onlineProducts = result[8].products;
					// substitute today's fresher data sets for the stale data 
					// 		in the larger data set
					// eslint-disable-next-line prefer-destructuring
					onsiteProducts[0] = onsiteProductsToday[0];
					// eslint-disable-next-line prefer-destructuring
					onlineProducts[0] = onlineProductsToday[0];
					// set up empty container schedule; using an object for this so we can easily
					// 		get elements / properties by date
					const schedule = {};
					// get a set of exceptions by individual dates, then times
					// set up container
					const hoursExceptionsByDate = {};
					// for each exception in hoursExceptions
					hoursExceptions.forEach((oneException) => {
						// get / interpret this exception's start and end dates
						// eslint-disable-next-line prefer-const
						let startDate = moment(oneException.startDate);
						const endDate = moment(oneException.endDate);
						// get an array of the dates for this exception
						// set up container array
						const datesThisException = [];
						// set up vars for days processed so far and days in exception
						let quantityDaysInExceptionProcessed = 0;
						const quantityDaysInException = endDate.diff(startDate, 'days');
						// while days processed is not more than days in exception
						while (quantityDaysInExceptionProcessed <= quantityDaysInException) {
							// add a date to dates for this exception
							datesThisException.push(
								moment(startDate).add(quantityDaysInExceptionProcessed, 'days'),
							);
							// add 1 to days processed
							quantityDaysInExceptionProcessed += 1;
						}
						// for each date in the exception
						datesThisException.forEach((oneDateThisException) => {
							const newException = {
								location: oneException.location,
								message: oneException.message,
							};
							if (oneException.closedAllDay) {
								newException.closedAllDay = true;
							}
							if (oneException.openingTime) {
								newException.openingTime = oneException.openingTime;
								newException.closingTime = oneException.closingTime;
							}
							hoursExceptionsByDate[moment(oneDateThisException).format('YYYY-MM-DD')] = newException;
						});
					});
					// add to schedule object 365 dates
					// set up vars for days processed so far and days in exception
					let quantityDaysInSkeletonScheduleProcessed = 0;
					const quantityDaysInSkeletonSchedule = 365;
					// while days processed is not more than days in skeleton schedule
					while (
						quantityDaysInSkeletonScheduleProcessed < quantityDaysInSkeletonSchedule
					) {
						// add a date to skeleton schedule
						schedule[moment(dateToday).add(quantityDaysInSkeletonScheduleProcessed, 'days').format('YYYY-MM-DD')] = {};
						// add 1 to days processed
						quantityDaysInSkeletonScheduleProcessed += 1;
					}
					// for each date in the schedule, add either standard hours
					// 		or exceptional hours, and any web messaging
					Object.keys(schedule).forEach((scheduleKey) => {
						// set up container object for hours data for this day
						let hoursThisDay = {};
						// attempt to get an exception for this day
						const hoursExceptionThisDay = hoursExceptionsByDate[scheduleKey];
						// if an exception for this day was found
						if (hoursExceptionThisDay) {
							// add its location, message to hours for this day
							hoursThisDay.exceptionLocation = 
								hoursExceptionThisDay.location;
							hoursThisDay.exceptionMessage = 
								hoursExceptionThisDay.message;
							// if exception indicates all day closure
							if (hoursExceptionThisDay.closedAllDay) {
								// set open = false for hours this day
								hoursThisDay.open = false;
							// if exception does not indicate all day closure 
							// 		and does indicate an opening time
							} else if (hoursExceptionThisDay.openingTime) {
								// set open = true for hours this day
								hoursThisDay.open = true;
								// add opening and closing times 
								// 		to hours for this day
								hoursThisDay.openingTime = 
									moment(`${scheduleKey} ${hoursExceptionThisDay.openingTime}`)
										.format('HH:mm');
								hoursThisDay.closingTime = 
									moment(`${scheduleKey} ${hoursExceptionThisDay.closingTime}`)
										.format('HH:mm');
							}
						// if NO exception for this day was found
						} else {
							// add to hours for this day the standard 
							// 		opening and closing times for
							// 		this day of the week
							hoursThisDay = standardHours[moment(scheduleKey).format('dddd')];
							// set open = true for hours this day
							hoursThisDay.open = true;
						}
						// if this day has an opening time and closing time
						if (hoursThisDay.openingTime && hoursThisDay.closingTime) {
							// add formatted versions of these times
							hoursThisDay.openingTimeFormatted =
								moment(`${scheduleKey}T${hoursThisDay.openingTime}`)
									.format('h:mm a');
							hoursThisDay.closingTimeFormatted =
								moment(`${scheduleKey}T${hoursThisDay.closingTime}`)
									.format('h:mm a');
						}
						// add hours this day to schedule
						schedule[scheduleKey].hours = hoursThisDay;
					});
					// for each date in the set of onsite products
					onsiteProducts.forEach((oneDateProducts) => {
						// extract this date and datetime for convenience
						const thisDate = moment(oneDateProducts.date).format('YYYY-MM-DD');
						// get this date in the schedule ready to receive products
						schedule[thisDate].products = {
							onsite: [],
							online: [],
						};
						// set up container for this date's produts
						const onsiteProductsThisDate = [];
						// for each venue on this date
						oneDateProducts.venue.forEach((oneDateVenueProducts) => {
							// extract this venue data
							// set up var for this venue
							let thisVenue = {};
							// for all venues in the set of venues
							venues.forEach((oneVenueConfig) => {
								// if this venue config has a tessitura feed name
								if (
									oneVenueConfig.tessituraFeedName &&
									oneVenueConfig.tessituraFeedName === oneDateVenueProducts.title
								) {
									// use this venue config for this venue
									thisVenue = oneVenueConfig;
								}
							});
							// for each product in this venue
							oneDateVenueProducts.show.forEach((oneDateVenueProduct) => {
								// extract the data that is common to all instances (times) of this product
								const thisProductCommonData = {
									title: oneDateVenueProduct.title,
									psid: oneDateVenueProduct.eventnumber,
									length: oneDateVenueProduct.length,
									location: oneDateVenueProduct.location,
									venue: thisVenue,
									ageRange: {
										weight: 1,
										lowestAge: 3,
										highestAge: 6,
										shortDisplayString: 'Ages 3 &ndash; 6',
										longDisplayString: 'Ages 3 &ndash; 6 (Preschool/Early Learners)',
									},
								};
								// for each node in the set of scheduled Drupal nodes
								scheduledNodes.forEach((scheduledNode) => {
									// if this scheduled node's daily schedule ID matches 
									// 		this product's psid
									if (scheduledNode.dailyScheduleID === thisProductCommonData.psid) {
										// add the node's URL to the common product data
										thisProductCommonData.listingURL = scheduledNode.url;
									}
								});
								// for each time for this product
								oneDateVenueProduct.time.forEach((oneDateVenueProductInstance) => {
									// extract this product's end time for comparison
									const oneDateVenueProductInstanceEndDatetime = 
										moment(`${thisDate} ${oneDateVenueProductInstance.endtime}`);
									// if this end time is present or in the future and 
									// 		it's not full / sold out
									if (
										oneDateVenueProductInstanceEndDatetime.isSameOrAfter(thisMoment, 'second') && 
										oneDateVenueProductInstance.instock > 0
									) {
										// construct a unique product out of the product's 
										// 		common data and the instance data
										// start with unique copy of common data
										const thisProduct = 
											Utilities.ReturnUniqueObjectGivenAnyValue(thisProductCommonData);
										// add data unique to this instance
										thisProduct.endTime = oneDateVenueProductInstanceEndDatetime.format('HH:mm');
										thisProduct.startTime = moment(`${thisDate} ${oneDateVenueProductInstance.starttime}`).format('HH:mm');
										thisProduct.endTimeFormatted =
											moment(`${thisDate} ${thisProduct.endTime}`)
												.format('h:mm a');
										thisProduct.startTimeFormatted =
											moment(`${thisDate} ${thisProduct.startTime}`)
												.format('h:mm a');
										thisProduct.remaining = oneDateVenueProductInstance.instock;
										// if this product is for schools only
										if (oneDateVenueProductInstance.schoolonly === '1') {
											// set corresponding flag on this product
											thisProduct.schoolOnly = true;
										}
										// push to products this date container
										onsiteProductsThisDate.push(thisProduct);
									}
								});
							});
						});
						// sort this date's products by time, ascending
						onsiteProductsThisDate.sort(
							module.exports.ReturnObjectStartTimePropertyWeightRelativeToAnother,
						);
						// add this date's products to the onsite products for 
						// 		this date in the schedule
						schedule[thisDate].products.onsite = onsiteProductsThisDate;
					});
					// for each date in the set of online products
					onlineProducts.forEach((oneDateProducts) => {
						// extract this date and datetime for convenience
						const thisDate = moment(oneDateProducts.date).format('YYYY-MM-DD');
						// set up container for this date's produts
						const onlineProductsThisDate = [];
						// for each venue on this date
						oneDateProducts.venue.forEach((oneDateVenueProducts) => {
							// extract this venue data
							// set up var for this venue
							let thisVenue = {};
							// for all venues in the set of venues
							venues.forEach((oneVenueConfig) => {
								// if this venue config has a tessitura feed name
								if (
									oneVenueConfig.tessituraFeedName &&
									oneVenueConfig.tessituraFeedName === oneDateVenueProducts.title
								) {
									// use this venue config for this venue
									thisVenue = oneVenueConfig;
								}
							});
							const thisChannel = 
								module.exports.ReturnChannelNameFromVenue(thisVenue.shortName, channels);
							// for each product in this venue
							oneDateVenueProducts.show.forEach((oneDateVenueProduct) => {
								// extract the data that is common to all instances (times) of this product
								const thisProductCommonData = {
									title: oneDateVenueProduct.title,
									psid: oneDateVenueProduct.eventnumber,
									length: oneDateVenueProduct.length,
									channel: thisChannel,
									ageRange: {
										weight: 1,
										lowestAge: 3,
										highestAge: 6,
										shortDisplayString: 'Ages 3 &ndash; 6',
										longDisplayString: 'Ages 3 &ndash; 6 (Preschool/Early Learners)',
									},
								};
								// for each node in the set of scheduled Drupal nodes
								scheduledNodes.forEach((scheduledNode) => {
									// if this scheduled node's daily schedule ID matches 
									// 		this product's psid
									if (scheduledNode.dailyScheduleID === thisProductCommonData.psid) {
										// add the node's URL to the common product data
										thisProductCommonData.listingURL = scheduledNode.url;
									}
								});
								// for each time for this product
								oneDateVenueProduct.time.forEach((oneDateVenueProductInstance) => {
									// extract this product's end time for comparison
									const oneDateVenueProductInstanceEndDatetime =
										moment(`${thisDate} ${oneDateVenueProductInstance.endtime}`);
									// if this end time is present or in the future and 
									// 		it's not full / sold out
									if (
										oneDateVenueProductInstanceEndDatetime.isSameOrAfter(thisMoment) &&
										oneDateVenueProductInstance.instock > 0
									) {
										// construct a unique product out of the product's 
										// 		common data and the instance data
										// start with unique copy of common data
										const thisProduct =
											Utilities.ReturnUniqueObjectGivenAnyValue(thisProductCommonData);
										// add data unique to this instance
										thisProduct.endTime = oneDateVenueProductInstanceEndDatetime.format('HH:mm');
										thisProduct.startTime = moment(`${thisDate} ${oneDateVenueProductInstance.starttime}`).format('HH:mm');
										thisProduct.endTimeFormatted =
											moment(`${thisDate} ${thisProduct.endTime}`)
												.format('h:mm a');
										thisProduct.startTimeFormatted =
											moment(`${thisDate} ${thisProduct.startTime}`)
												.format('h:mm a');
										thisProduct.remaining = oneDateVenueProductInstance.instock;
										// if this product is for schools only
										if (oneDateVenueProductInstance.schoolonly === '1') {
											// set corresponding flag on this product
											thisProduct.schoolOnly = true;
										}
										// push to products this date container
										onlineProductsThisDate.push(thisProduct);
									}
								});
							});
						});
						// sort this date's products by time, ascending
						onlineProductsThisDate.sort(
							module.exports.ReturnObjectStartTimePropertyWeightRelativeToAnother,
						);
						// add this date's products to the online products for
						// 		this date in the schedule
						schedule[thisDate].products.online = onlineProductsThisDate;
					});
					// convert the schedule object into an array with the date as an array element
					// set up container
					const scheduleArray = [];
					// for each schedule object key, which is a date
					Object.keys(schedule).forEach((scheduleDateKey) => {
						// push an object element to container array
						scheduleArray.push({
							date: new Date(`${scheduleDateKey}T00:00:00`),
							hours: schedule[scheduleDateKey].hours,
							products: schedule[scheduleDateKey].products,
						});
					});
					// resolve this promise with the schedule array
					resolve(scheduleArray);
				})
				// if the promise is rejected with an error
				.catch((error) => {
					// reject this promise with the error
					reject(error);
				});
		}),

	ReturnChannelNameFromVenue: (venueShortName, allChannels) => {
		let channelToReturn;
		switch (venueShortName) {
		case 'Exhibits':
			channelToReturn = allChannels[1];
			break;
		case 'Omni Theater':
			channelToReturn = allChannels[2];
			break;
		case 'Planetarium':
			channelToReturn = allChannels[3];
			break;
		case 'Live Presentations':
			channelToReturn = allChannels[4];
			break;
		case 'Drop-In Activities':
			channelToReturn = allChannels[5];
			break;
		case '4-D Theater':
			channelToReturn = allChannels[6];
			break;
		default:
			channelToReturn = allChannels[0];
			break;
		}
		return channelToReturn;
	},


	ReturnObjectStartTimePropertyWeightRelativeToAnother: (a, b) => {
		if (a.startTime < b.startTime) {
			return -1;
		}
		if (a.startTime > b.startTime) {
			return 1;
		}
		return 0;
	},

	UpdateMOSScheduleData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get fresh schedule data
			module.exports.ReturnMOSSchedule()
				// if the promise is resolved with a result
				.then((scheduleResult) => {
					// get a promise to delete all documents
					DataQueries.DeleteAllDocsFromCollection('productsSchedules')
						// if the promise is resolved with the result
						.then((deletionResult) => {
							// for each element in schedule result array
							scheduleResult.forEach((oneDaySchedule) => {
								// get a promise to insert
								DataQueries.InsertDocIntoCollection(oneDaySchedule, 'productsSchedules')
									// if the promise is resolved with the result
									.then((insertResult) => {
										// resolve this promise with the result
										resolve(insertResult);
									})
									// if the promise is rejected with an error, then reject this promise with an error
									.catch((insertError) => {
										reject(insertError);
									});
							});
						})
						// if the promise is rejected with an error, then reject this promise with an error
						.catch((insertError) => {
							reject(insertError);
						});
				})
				// if the promise is rejected with an error
				.catch((scheduleError) => {
					// reject this promise with the error
					reject(scheduleError);
				});
		}),

	ReturnSpecifiedMOSProductsSchedules: (firstOrOnlyDateTime, lastDateTime) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// start off query object
			const queryObject = {};
			// if there is a last date
			if (lastDateTime) {
				// modify query object to use a date range
				queryObject.date = { 
					$gte: new Date(
						moment(firstOrOnlyDateTime).format('YYYY'),
						parseInt(moment(firstOrOnlyDateTime).format('M'), 10) - 1,
						moment(firstOrOnlyDateTime).format('D'),
					),
					$lte: new Date(
						moment(lastDateTime).format('YYYY'),
						parseInt(moment(lastDateTime).format('M'), 10) - 1,
						moment(lastDateTime).format('D'),
					),
				};
			// if there's no last date
			} else {
				// modify the query object to use one date
				queryObject.date = { 
					$eq: new Date(
						moment(firstOrOnlyDateTime).format('YYYY'),
						parseInt(moment(firstOrOnlyDateTime).format('M'), 10) - 1,
						moment(firstOrOnlyDateTime).format('D'),
					),
				};
			}
			// get a promise to 
			DataQueries.ReturnSpecifiedDocsFromCollectionSorted(
				'productsSchedules',
				queryObject,
				'date',
				'ascending',
			)
				// if the promise is resolved with a result
				.then((queryResult) => {
					// then resolve this promise with the result
					resolve(queryResult.docs);
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with the error
					reject(queryError);
				});
		}),

	/**
	 * @name ReturnAllPresentFutureEventBriteEvents
	 * @function
	 * @async
	 * @description Return events from the EventBrite API
	 */

	ReturnAllLiveEventBriteEvents: (accoutToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve
			axios.get(
				`https://www.eventbriteapi.com/v3/organizations/${process.env.eventBriteMarketingOrganizationID}/events`,
				{
					headers: {
						Authorization: `Bearer ${process.env.eventBriteMarketingBearerToken}`,
						// 'Content-Type': 'application/json',
					},
					params: {
						status: 'live',
						expand: 'ticket_availability',
					},
					timeout: 15000,
				},
			)
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve(result.data);
						// if status indicates other than success
					} else {
						// reject this promise with the error
						reject(result.status);
					}
				})
				// if the promise is rejected with an error, 
				.catch((error) => {
					// reject this promise with an error
					reject(error);
				});
		}),

};
module.exports.ReturnAllLiveEventBriteEvents();
