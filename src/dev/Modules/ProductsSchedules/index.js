/* eslint-disable no-underscore-dangle */
/**
 * @name Health
 * @service
 * @description Performs all health-related operations.
 */

const axios = require('axios');
const DataConnection = require('data-connection');
const DataQueries = require('data-queries');
const moment = require('moment-timezone');
const Utilities = require('utilities');
const { ReturnTerseEmailAddressFromFriendly } = require('utilities');

moment.suppressDeprecationWarnings = true;
moment.tz.setDefault('UTC');

module.exports = {

	// --- DATA PULLS

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

	ReturnSpecifiedMOSProductsSchedules: (options) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// start off query and projection objects
			const queryObject = {};
			const projectionObject = {};
			// if only one date
			if (options.onlyDate) {
				// set query object to find docs where
				// 		dateString is the one date requested
				queryObject.dateString = {
					$eq: options.onlyDate,
				};
			// if multiple dates
			} else if (options.firstDate && options.lastDate) {
				// set query object to find docs where
				// 		dateString is >= first date and
				// 		dateString is <= last date
				queryObject.dateString = {
					$gte: options.firstDate,
					$lte: options.lastDate,
				};
			}
			// set projection object fields property 
			// 		to omit _id field
			projectionObject.fields = {
				_id: 0,
			};
			// if omission of all products was requested
			if (options.omitHours) {
				// set projection object fields property 
				// 		to omit requested field in products field
				projectionObject.fields.hours = 0;
			}
			// if omission of all products was requested
			if (options.omitProducts) {
				// set projection object fields property 
				// 		to omit requested field in products field
				projectionObject.fields.products = 0;
			}
			// if omission of a product type was requested
			if (options.omitProductType) {
				// set projection object fields property 
				// 		to omit requested field in products field
				projectionObject.fields[`products.${options.omitProductType}`] = 0;
			}
			// get a promise to get the docs specified above
			DataConnection.get('productsSchedules')
				.find(queryObject, projectionObject, (error, docs) => {
					// if there was an error
					if (error) {
						// resolve this promise with a custom error
						reject({
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						});
					// if there was NOT an error
					} else {
						// set up container for days
						const allDays = [];
						// for each day in the docs
						docs.forEach((day) => {
							// get a copy of the day to preserve param
							let thisDay = { ...day };
							// if the summarize venues option was passed
							if (options.summarizeVenues) {
								// set this day to a day with summarized venues
								thisDay = module.exports.ReturnDayWithSummarizedVenues(thisDay, options.summarizeVenues);
							}
							// the group products by time option was passed
							if (options.groupProductsByTime) {
								// set this day to a day with summarized venues
								thisDay = module.exports.ReturnDayWithProductsGroupedByTime(thisDay);
							}
							// 
							allDays.push(
								thisDay,
							);
						});
						resolve(allDays);
					}
				});
		}),
	ReturnProductsGroupedByTime: (products) => {
		// set up products container
		const productsByTime = {};
		if (products && products[0]) {			
			// for each product in array of products
			products.forEach((product) => {
				// if this product's start time is not 
				// 		already in products by time
				if (!productsByTime[product.startTime]) {
					// add this time
					productsByTime[product.startTime] = {
						startTimeFormatted: product.startTimeFormatted,
						productsThisTime: [],
					};
				}
				// push this product to this time
				productsByTime[product.startTime].productsThisTime.push(product);
			});
		}
		return productsByTime;
	},

	ReturnProductsWithSummarizedVenues: (products, summaryVenues) => {
		// set up products container
		const productsWithSummarizedVenues = {
			standardProducts: [],
		};
		// set up an intermediate container
		const summarizedVenues = {};
		// for each product in array of products
		products.forEach((product) => {
			// if this product's venue's short name is in the array of summary venues
			if (summaryVenues.includes(product.venue['short-name'])) {
				// if this venue is not already in the summarized venues object
				if (!summarizedVenues[product.venue['short-name']]) {
					// add this venue to the summarized venues object
					summarizedVenues[product.venue['short-name']] = 
						product.venue;
					// add a prodcuts container to this venue in the summarized venues object
					summarizedVenues[product.venue['short-name']].products = {
						allProducts: [],
						earliestProduct: null,
						latestProduct: null,
					};
				}
				// get a copy of the product, minus the venue
				const productCopy = { ...product };
				delete productCopy.venue;
				// add this product, minus venue, to this venue's all products
				summarizedVenues[product.venue['short-name']].products.allProducts.push(productCopy);
			// if this product's venue's short name is NOT in the array of summary venues
			} else {
				productsWithSummarizedVenues.standardProducts.push(product);
			}
		});
		// for each summarized venue
		Object.keys(summarizedVenues).forEach((summarizedVenueKey) => {
			// sort all products by time, ascending
			summarizedVenues[summarizedVenueKey].products.allProducts.sort(
				module.exports.ReturnObjectStartTimePropertyWeightRelativeToAnother,
			);
			// set the earliest and latest products
			// eslint-disable-next-line prefer-destructuring
			summarizedVenues[summarizedVenueKey].products.earliestProduct =
				summarizedVenues[summarizedVenueKey].products.allProducts[0];
			summarizedVenues[summarizedVenueKey].products.latestProduct =
				summarizedVenues[summarizedVenueKey].products.allProducts[summarizedVenues[summarizedVenueKey].products.allProducts.length - 1];
		});
		// add intermediate container into main container
		productsWithSummarizedVenues.summarizedVenues = 
			summarizedVenues;
		return productsWithSummarizedVenues;
	},
	

	ReturnDayWithProductsGroupedByTime: (day) => {
		// set up container for this day's reorganized data
		const reorganizedDay = {
			dateString: day.dateString,
		};
		// if day has hours
		if (day.hours) {
			// add this day's hours to container
			reorganizedDay.hours = day.hours;
		}
		// if day has products
		if (day.products) {
			// add this day's hours to container
			reorganizedDay.products = {};
			// if day has onsite products
			if (day.products.onsite) {
				// set up container
				reorganizedDay.products.onsite = {
					summarizedVenues: day.products.onsite.summarizedVenues,
				};
				// if there are standard products for this day
				if (
					day.products.onsite.standardProducts &&
					day.products.onsite.standardProducts[0]
				) {
					// add them to container grouped by time
					reorganizedDay.products.onsite.standardProducts = 
						module.exports.ReturnProductsGroupedByTime(day.products.onsite.standardProducts[0]);
				}
			}
			// if day has onsite standard products
			if (
				day.products.onsite &&
				day.products.onsite.standardProducts && 
				day.products.onsite.standardProducts[0]
			) {
				reorganizedDay.products.onsite = {
					summarizedVenues: day.products.onsite.summarizedVenues,
					standardProducts: 
						module.exports.ReturnProductsGroupedByTime(day.products.onsite.standardProducts),
				};
			}
			// if day has online products
			if (
				day.products.online &&
				day.products.online[0]
			) {
				reorganizedDay.products.online =
					module.exports.ReturnProductsGroupedByTime(day.products.online);
			}
		}
		return reorganizedDay;
	},

	ReturnDayWithSummarizedVenues: (day, summaryVenues) => {
		// set up container for this day's reorganized data
		const reorganizedDay = {
			dateString: day.dateString,
		};
		// if day has hours
		if (day.hours) {
			// add this day's hours to container
			reorganizedDay.hours = day.hours;
		}
		// if day has products
		if (day.products) {
			// add this day's hours to container
			reorganizedDay.products = {};
			// if day has onsite products
			if (
				day.products.onsite &&
				day.products.onsite[0]
			) {
				reorganizedDay.products.onsite =
					module.exports.ReturnProductsWithSummarizedVenues(
						day.products.onsite, 
						summaryVenues.split(','),
					);
			}
			// if day has online products
			if (
				day.products.online &&
				day.products.online[0]
			) {
				reorganizedDay.products.online = day.products.online;
			}
		}
		return reorganizedDay;
	},

	// --- CRON PROCESSING

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
						resolve(productsJSON);
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
	 * @name ReturnDataFromMOSDrupal
	 * @function
	 * @async
	 * @description Return data from the mos.org Drupal API
	 */

	ReturnDataFromMOSDrupal: (apiEndpointToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve
			axios.get(`https://www.mos.org${apiEndpointToken}`)
				// if the promise is resolved
				.then((result) => {
					// if status indicates success
					if (result.status === 200) {
						// resolve this promise with the list items
						resolve(result.data.items);
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

	ReturnAllLiveEventBriteEvents: (accoutToken) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// set environment variable names
			const organizationID =
				// eslint-disable-next-line no-eval
				eval(`process.env.eventBrite${accoutToken}OrganizationID`);
			const bearerToken =
				// eslint-disable-next-line no-eval
				eval(`process.env.eventBrite${accoutToken}BearerToken`);
			// get a promise to retrieve
			axios.get(
				`https://www.eventbriteapi.com/v3/organizations/${organizationID}/events`,
				{
					headers: {
						Authorization: `Bearer ${bearerToken}`,
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
						resolve(result.data.events);
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


	// validity means live, listed, and online in EventBrite, and published in Drupal
	ReturnValidEventBriteEventInTessituraFormat: (event, scheduledNodes) => {
		// if this event is listed (i.e., public)
		if (event.listed) {
			// set flag defaulting to indicating that even is not published in Drupal
			let publishedInDrupal = false;
			// for each node in scheduled nodes
			scheduledNodes.forEach((scheduledNode) => {
				// if this node has a registration URL and it matches the event's url
				if (
					scheduledNode['registration-url'] &&
					scheduledNode['registration-url'] === event.url
				) {
					// alter the flag to indicate that the event is published in Drupal
					publishedInDrupal = true;
				}
			});
			// if this event is publised in Drupal and the event is an online event
			if (publishedInDrupal && event.online_event) {
				// set up an event to return
				const formattedEvent = {
					date: moment(event.start.local).format('YYYY/MM/DD'),
					venue: event.online_event ? 'MOS at Home' : 'Events',
					'registration-url': event.url,
					time: [
						{
							endtime: moment(event.end.local).format('HH:mm'),
							instock: null,
							starttime: moment(event.start.local).format('HH:mm'),
						},
					],
				};
				// return this promise with the event
				return formattedEvent;
				// if this event is NOT publised in Drupal
			}
			// return this promise with a null value
			return null;

			// if this event is NOT listed (i.e., not public)
		}
		// return this promise with a null value
		return null;
	},

	// validity means all required fields populated and published in Drupal; Drupal-only
	// 		means that the even does not exist in Tessitura or EventBrite
	ReturnValidDrupalOnlyEventInTessituraFormat: (event) => {
		// if this event does not have a Tessitura PSID, and its third-party
		// 		registration URL is not an EventBrite URL, and it has
		// 		the required fields
		if (
			event && 
			!event['tessitura-psid'] &&
			event['registration-url'] &&
			!event['registration-url'].includes('eventbrite.com') && 
			event.title && 
			event['start-date'] && 
			event['end-date'] && 
			event['age-range-ids'] && 
			event.published && 
			event.published === '1'
		) {
			return {
				date: moment(event['start-date']).format('YYYY/MM/DD'),
				venue: event['channel-ids'] ? 'MOS at Home' : 'Events',
				'registration-url': event['registration-url'],
				time: [
					{
						endtime: moment(event['end-date']).format('HH:mm'),
						instock: null,
						starttime: moment(event['start-date']).format('HH:mm'),
					},
				],
			};
		}
		// return this promise with a null value
		return null;
	},

	ReturnValidEventBriteEventSetInTessituraFormat: (eventSet, scheduledNodes) => {
		// set up a container for valid, formatted events
		const validFormattedEvents = [];
		// for each event in the event set
		eventSet.forEach((event) => {
			// attempt to get a formatted event
			const attemptedFormattedEvent = module.exports
				.ReturnValidEventBriteEventInTessituraFormat(event, scheduledNodes);
			// if an event was returned
			if (attemptedFormattedEvent) {
				// add it to the container
				validFormattedEvents.push(attemptedFormattedEvent);
			}
		});
		return validFormattedEvents;
	},


	ReturnValidDrupalOnlyEventSetInTessituraFormat: (scheduledNodes) => {
		// set up a container for valid, formatted events
		const validFormattedEvents = [];
		// for each node in the node set
		scheduledNodes.forEach((node) => {
			// attempt to get a formatted, Drupal-only event
			const attemptedFormattedEvent = module.exports
				.ReturnValidDrupalOnlyEventInTessituraFormat(node);
			// if an event was returned
			if (attemptedFormattedEvent) {
				// add it to the container
				validFormattedEvents.push(attemptedFormattedEvent);
			}
		});
		return validFormattedEvents;
	},

	ReturnStandardHoursAsObjectByDays: (hoursArray) => {
		// set up container object for all the days
		const standardHoursByDays = {};
		// for each day in received array of days
		hoursArray.forEach((dayObject) => {
			// add a day with times to container object
			standardHoursByDays[dayObject['day-of-week']] = {
				openingTime: dayObject['opening-time'],
				closingTime: dayObject['closing-time'],
			};
		});
		// return container for all the days
		return standardHoursByDays;
	},

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
				module.exports.ReturnDataFromMOSDrupal('/api-config/venues'),
				module.exports.ReturnDataFromMOSDrupal('/api-config/channels'),
				module.exports.ReturnDataFromMOSDrupal('/api-config/hours-standard'),
				module.exports.ReturnDataFromMOSDrupal('/api-content/hours-exceptions'),
				module.exports.ReturnDataFromMOSDrupal('/api-content/scheduled-nodes'),
				module.exports.ReturnDataFromMOSDrupal('/api-config/age-ranges'),
				module.exports.ReturnDataFromMOSDrupal('/api/v1/svg.json'),
				module.exports.ReturnTessituraProductsFromTriton('productsTodayDailySchedule.json'),
				module.exports.ReturnTessituraProductsFromTriton('products365DaysDailySchedule.json'),
				module.exports.ReturnTessituraProductsFromTriton('productsTodayMOSAtHome.json'),
				module.exports.ReturnTessituraProductsFromTriton('products14DaysMOSAtHome.json'),
				module.exports.ReturnAllLiveEventBriteEvents('Marketing'),
				module.exports.ReturnAllLiveEventBriteEvents('EiE'),
				module.exports.ReturnDataFromMOSDrupal('/api-content/old-offerings-for-schedule'),
			])
				// if the promise is resolved with a result
				.then((result) => {
					// get today's date
					const dateToday = moment().format('YYYY-MM-DD');
					// get this moment in time
					const thisMoment = moment().tz('UTC');
					// extract data for convenience
					const venues = result[0];
					const channels = result[1];
					const hoursStandard = 
						module.exports.ReturnStandardHoursAsObjectByDays(result[2]);
					const hoursExceptions = result[3];
					let scheduledNodes = result[4];
					const ageRanges = result[5];
					const svgs = result[6];
					const onsiteProductsToday = result[7];
					const onsiteProducts = result[8];
					const onlineProductsToday = result[9];
					const onlineProducts = result[10];
					const marketingEventBriteEvents = result[11];
					const eieEventBriteEvents = result[12];
					const oldOfferingNodes = result[13];
					// temporary - merge old and new offerings
					scheduledNodes = scheduledNodes.concat(oldOfferingNodes);
					// get an array of all valid event brite events in a Tessitura-like format; 
					// 		validity means live, listed, and online in EventBrite, and 
					// 		published in Drupal
					const allValidEventBriteEventsFormatted =
						module.exports.ReturnValidEventBriteEventSetInTessituraFormat(
							marketingEventBriteEvents,
							scheduledNodes,
						).concat(module.exports.ReturnValidEventBriteEventSetInTessituraFormat(
							eieEventBriteEvents,
							scheduledNodes,
						));
					// get an array of all valid non-EventBrite and non-Tessitura events in a 
					// 		Tessitura-like format; valid means that all required fields were
					// 		populated in Drupal and the node was published
					const allValidDrupalOnlyEventsFormatted =
						module.exports.ReturnValidDrupalOnlyEventSetInTessituraFormat(
							scheduledNodes,
						);
					// merge all schedule data into two places, one onsite and the other online
					// substitute today's fresher data sets for the stale data 
					// 		in the larger data set
					if (onsiteProductsToday && onsiteProductsToday[0]) {
						// eslint-disable-next-line prefer-destructuring
						onsiteProducts[0] = onsiteProductsToday[0];
					}
					if (onlineProductsToday && onlineProductsToday[0]) {
						// eslint-disable-next-line prefer-destructuring
						onlineProducts[0] = onlineProductsToday[0];
					}
					// add event brite events to online products
					// for each event brite event
					allValidEventBriteEventsFormatted.forEach((eventBriteEvent) => {
						// set flag indicating that this event's date is not already
						// 		in online products
						let thisEventBriteEventDateAlreadyInOnlineProducts = false;
						// for each date in the set of online products
						onlineProducts.forEach((oneDateProducts) => {
							// if this event brite event date matches this date in online products
							if (
								oneDateProducts && oneDateProducts.date && 
								eventBriteEvent.date === oneDateProducts.date
							) {
								// push this event to array of this day's mos at home venue's shows
								oneDateProducts.venue[0].show.push(eventBriteEvent);
								// alter flag to indicate that this event brite event's date
								// 		was already in online products
								thisEventBriteEventDateAlreadyInOnlineProducts = true;
							}
						});
						// if this event brite event's date was not already in online products
						if (!thisEventBriteEventDateAlreadyInOnlineProducts) {
							// then push a new date to online products
							onlineProducts.push({
								date: eventBriteEvent.date,
								venue: [{
									title: 'MOS at Home',
									memberonly: '0',
									show: [{
										'registration-url': eventBriteEvent['registration-url'],
										time: eventBriteEvent.time,
									}],
								}],
							});
						}
					});
					// add drupal-only events to online products
					// for each drupal-only event
					allValidDrupalOnlyEventsFormatted.forEach((drupalEvent) => {
						// set flag indicating that this event's date is not already
						// 		in online products
						let thisdrupalEventDateAlreadyInOnlineProducts = false;
						// for each date in the set of online products
						onlineProducts.forEach((oneDateProducts) => {
							// if this drupal event date matches this date in online products
							if (drupalEvent.date === oneDateProducts.date) {
								// push this event to array of this day's mos at home venue's shows
								oneDateProducts.venue[0].show.push(drupalEvent);
								// alter flag to indicate that this event brite event's date
								// 		was already in online products
								thisdrupalEventDateAlreadyInOnlineProducts = true;
							}
						});
						// if this event brite event's date was not already in online products
						if (!thisdrupalEventDateAlreadyInOnlineProducts) {
							// then push a new date to online products
							onlineProducts.push({
								date: drupalEvent.date,
								venue: [{
									title: 'MOS at Home',
									memberonly: '0',
									show: [{
										'registration-url': drupalEvent['registration-url'],
										time: drupalEvent.time,
									}],
								}],
							});
						}
					});
					// for convenience, not necessity, sort all products by date ascending
					onlineProducts.sort(
						module.exports.ReturnObjectDatePropertyWeightRelativeToAnother,
					);
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
						let startDate = moment(oneException['start-date']);
						const endDate = moment(oneException['end-date']);
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
							if (oneException['closed-all-day']) {
								newException.closedAllDay = true;
							}
							if (oneException['opening-time']) {
								newException.openingTime = oneException['opening-time'];
								newException.closingTime = oneException['closing-time'];
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
						schedule[moment(dateToday).add(quantityDaysInSkeletonScheduleProcessed, 'days').format('YYYY-MM-DD')] = {
							hours: {},
							products: {
								onsite: [],
								online: [],
							},
						};
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
							} else if (
								hoursExceptionThisDay.openingTime && 
								hoursExceptionThisDay.closingTime
							) {
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
							// if not closed all day and no opening and closing times
							// 		were specified
							} else {
								// add to hours for this day the standard 
								// 		opening and closing times for
								// 		this day of the week
								hoursThisDay = hoursStandard[moment(scheduleKey).format('dddd')];
								// set open = true for hours this day
								hoursThisDay.open = true;
							}
						// if NO exception for this day was found
						} else {
							// add to hours for this day the standard 
							// 		opening and closing times for
							// 		this day of the week
							hoursThisDay = hoursStandard[moment(scheduleKey).format('dddd')];
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
						// if oneDateProducts is truthy
						if (oneDateProducts) {
							// extract this date and datetime for convenience
							const thisDate = moment(oneDateProducts.date).format('YYYY-MM-DD');
							// if this date is in the schedule
							if (schedule[thisDate]) {
								// add this date's valid augmented products to the online products for
								// 		this date in the schedule
								schedule[thisDate].products.onsite =
									module.exports.ReturnAllValidAugmentedFormattedProductsForDay({
										dateToday,
										thisDate,
										oneDateProducts,
										scheduledNodes,
										venues,
										channels,
										ageRanges,
										svgs,
									});
							}
						}
					});
					// for each date in the set of online products
					onlineProducts.forEach((oneDateProducts) => {
						// if oneDateProducts is truthy
						if (oneDateProducts) {
							// extract this date and datetime for convenience
							const thisDate = moment(oneDateProducts.date).format('YYYY-MM-DD');
							// if this date is in the schedule
							if (schedule[thisDate]) {
								// add this date's valid augmented products to the online products for
								// 		this date in the schedule
								schedule[thisDate].products.online = 
									module.exports.ReturnAllValidAugmentedFormattedProductsForDay({
										dateToday,
										thisDate,
										oneDateProducts,
										scheduledNodes,
										venues,
										channels,
										ageRanges,
										svgs,
									});
							}
						}
					});
					// convert the schedule object into an array with the date as an array element
					// set up container
					const scheduleArray = [];
					// for each schedule object key, which is a date
					Object.keys(schedule).forEach((scheduleDateKey) => {
						// push an object element to container array
						scheduleArray.push({
							dateString: scheduleDateKey,
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
	
	ReturnAgeDataForProduct: (productAgeRangeIDArray, ageRanges) => {
		// set up age array container and formatted age range string
		const productAgeRangeArray = [];
		let productAgeRangeFormatted = '';
		// for each age id in age id array
		productAgeRangeIDArray.forEach((ageRangeID) => {
			// for each age range in the array of age ranges
			ageRanges.forEach((ageRange) => {
				// if this age range's ID matches this product age range ID
				if (ageRange.id === ageRangeID) {
					// push this age range to the age range array
					productAgeRangeArray.push(ageRange);
				}
			});
		});
		// if an age range was found
		if (productAgeRangeArray[0]) {
			// set a flag to default to displaying prefixes only
			let displayPrefixesOnly = true;
			// for each age range in the array of age ranges for this product
			productAgeRangeArray.forEach((ageRange) => {
			// if this age range should NOT display prefix only
				if (
					!ageRange['prefix-only'] ||
					ageRange['prefix-only'] === '0'
				) {
				// alter flag to indicate we should not show prefixes only
					displayPrefixesOnly = false;
				}
			});
			// if we are displaying prefix only
			if (displayPrefixesOnly) {
			// then, de facto, there is only one age range
			// add the age range prefix to display string and be done
				productAgeRangeFormatted = productAgeRangeArray[0].prefix;
				// if we are not displaying prefix only
			} else {
			// begin display string with prefix
				productAgeRangeFormatted = productAgeRangeArray[0].prefix;
				// set the lower end of the age range we'll use to 
				// 		the lowest weighted age range's lower age
				const ageRangeLowerEnd = productAgeRangeArray[0]['lower-age'];
				// set the lower end of the age range we'll use to 
				// 		the lowest weighted age range's lower age
				const ageRangeUpperEnd = 
					productAgeRangeArray[productAgeRangeArray.length - 1]['upper-age'] !== '19' ? 
						productAgeRangeArray[productAgeRangeArray.length - 1]['upper-age'] :
						'Adults';
				// add lower and upper ages to display string
				productAgeRangeFormatted += 
				` ${ageRangeLowerEnd} &ndash; ${ageRangeUpperEnd} (`;
				// get all the suffixes from all of the age ranges
				// set up container for all age range suffixes
				const ageRangeSuffixes = [];
				// for each age range in the array of age ranges for this product
				productAgeRangeArray.forEach((ageRange) => {
				// for each suffix for this age range
					ageRange.suffixes.split(';')
						.forEach((suffix) => {
						// add this suffix to the array of suffixes
							ageRangeSuffixes.push(suffix);
						});
				});
				// for each age range suffix in the array of age range suffixes
				ageRangeSuffixes.forEach((suffixValue, suffixIndex) => {
				// if this is not the first element in the array
					if (suffixIndex !== 0) {
					// add separator before this suffix
						productAgeRangeFormatted += ' / ';
					}
					// add this suffix to this display string
					productAgeRangeFormatted += suffixValue;
				});
				// finish out display string
				productAgeRangeFormatted += ')';
			}
			// return object with all data
			return {
				ageRangeFormatted: productAgeRangeFormatted,
				ageRangeArray: productAgeRangeArray,
			};
		}
		return {};
	},

	ReturnAllValidAugmentedFormattedProductsForDay: ({ 
		dateToday,
		thisDate,
		oneDateProducts,
		scheduledNodes,
		venues,
		channels,
		ageRanges,
		svgs,
	}) => {
		// set up container for products for this date
		const validProductsThisDate = [];
		// for each venue on this date
		oneDateProducts.venue.forEach((oneDateVenueProducts) => {
			// extract this venue data
			// set up var for this venue
			let thisVenue = {};
			// for all venues in the set of venues
			venues.forEach((oneVenueConfig) => {
				// if this venue config has a tessitura feed name
				if (
					oneVenueConfig['tessitura-feed-name'] &&
					oneVenueConfig['tessitura-feed-name'] === oneDateVenueProducts.title
				) {
					// use this venue config for this venue
					thisVenue = oneVenueConfig;
				}
			});
			// for each product in this venue
			oneDateVenueProducts.show.forEach((oneDateVenueProduct) => {
				// set var for the scheduled node for this product,
				// 		defaulting to no node
				let scheduledNodeForThisProduct = null;
				// extract the data that is common to all instances (times)
				// 		of this product
				// set up container var
				const thisProductCommonData = {};
				// if a venue was found
				if (thisVenue) {
					// set the venue as the venue for this product
					thisProductCommonData.venue = thisVenue;
				}
				// if this product has a psid (seasonno)
				if (oneDateVenueProduct.seasonno) {
					// add it to the product's common data
					thisProductCommonData.psid =
						oneDateVenueProduct.seasonno;
				}
				// if this product has an event link
				if (oneDateVenueProduct.eventlink) {
					// add it to the product's common data
					thisProductCommonData.eventLink =
						oneDateVenueProduct.eventlink;
				}
				// if this product has a registration url
				if (oneDateVenueProduct['registration-url']) {
					// add it to the product's common data
					thisProductCommonData.registrationURL =
						oneDateVenueProduct['registration-url'];
				}
				// for each node in the set of scheduled Drupal nodes
				scheduledNodes.forEach((scheduledNode) => {
					// if this scheduled node's registration URL matches
					// 		this product's registration URL
					if (
						scheduledNode['registration-url'] && 
						scheduledNode['registration-url'] ===
						thisProductCommonData.registrationURL
					) {
						// set this node as the scheduled node for this product
						scheduledNodeForThisProduct = scheduledNode;
					}
					// if this scheduled node has a tessitura psid string
					if (
						scheduledNode['tessitura-psid'] && 
						typeof (scheduledNode['tessitura-psid']) === 'string'
					) {
						let scheduledNodePSIDs;
						// if tessitura psids contain a comma and space
						if (scheduledNode['tessitura-psid'].includes(', ')) {
							scheduledNodePSIDs = scheduledNode['tessitura-psid'].split(', ');
						} else {
							scheduledNodePSIDs = [scheduledNode['tessitura-psid']];
						}
						// if there's at least one PSID
						if (scheduledNodePSIDs && scheduledNodePSIDs[0]) {
							// for each of this scheduled node's tessitura psids 
							scheduledNodePSIDs.forEach((scheduledNodePSID) => {
								// if this scheduled node PSID matches this product's psid
								if (
									scheduledNodePSID ===
									thisProductCommonData.psid
								) {
									// set this node as the scheduled node for this product
									scheduledNodeForThisProduct = scheduledNode;
								}
							});
						}
					}
				});
				// continuing only if there is a scheduled node for this product
				if (scheduledNodeForThisProduct) {
					// add the node's URL, age data, and channel
					// 		to the common product data
					thisProductCommonData.title =
						scheduledNodeForThisProduct.title;
					thisProductCommonData.subtitle =
						scheduledNodeForThisProduct.subtitle;
					thisProductCommonData.listingURL =
						scheduledNodeForThisProduct['drupal-url'];
					// if this node has channel IDs
					if (scheduledNodeForThisProduct['channel-ids']) {
						// for each channel ID
						scheduledNodeForThisProduct['channel-ids']
							.split(', ').forEach((nodeChannelID) => {
								// for each channel in the array of channels
								channels.forEach((channel) => {
									// if this channel's id matches this node's channel id
									if (nodeChannelID === channel.id) {
										// if this product doesn't already have 
										// 		a channels property
										if (!thisProductCommonData.channels) {
											// create it
											thisProductCommonData.channels = [];
										}
										// add this channel to the product's channels
										thisProductCommonData.channels.push(channel);
									}
								});
							});
					}
					// if this product has channels
					if (thisProductCommonData.channels) {
						// for each of the product's channels
						thisProductCommonData.channels.forEach((productChannel) => {
							// for each svg
							svgs.forEach((svg) => {
								// if this svg id matches this channels
								if (svg.id === productChannel['svg-id']) {
									// add this svg as the channel's icon
									productChannel.icon = decodeURI(svg.content);
								}
							});
						});
					}
					// if this node has 1+ age ranges
					if (scheduledNodeForThisProduct['age-range-ids']) {
						// get the formatted age data from the node's age data and 
						// 		assign to this product
						thisProductCommonData.ageRanges = 
							module.exports.ReturnAgeDataForProduct(
								scheduledNodeForThisProduct['age-range-ids'].split(';'),
								ageRanges,
							);
					}
					// for each time for this product
					oneDateVenueProduct.time.forEach((oneDateVenueProductInstance) => {
						// extract this product's end time for comparison
						const oneDateVenueProductInstanceEndDatetime =
							moment(`${thisDate} ${oneDateVenueProductInstance.endtime}`)
								.add(4, 'hours');
						// if this end time is present or in the future and
						// 		either we're not tracking capacity or we are 
						// 		and it's not full / sold out
						if (
							oneDateVenueProductInstanceEndDatetime
								.isSameOrAfter(dateToday, 'day') &&
							(
								!oneDateVenueProductInstance.instock ||
								oneDateVenueProductInstance.instock > 0
							)
						) {
							// construct a unique product out of the product's
							// 		common data and the instance data
							// start with unique copy of common data
							const thisProduct =
								Utilities.ReturnUniqueObjectGivenAnyValue(
									thisProductCommonData,
								);
							// add data unique to this instance
							thisProduct.startTime =
								moment(
									`${thisDate} ${oneDateVenueProductInstance.starttime}`,
								).format('HH:mm');
							thisProduct.endTimeFormatted =
								moment(`${thisDate} ${thisProduct.endTime}`)
									.format('h:mm a');
							thisProduct.startTimeFormatted =
								moment(`${thisDate} ${thisProduct.startTime}`)
									.format('h:mm a');
							// if this product has an end time
							if (oneDateVenueProductInstance.endtime) {
								// set end time on this product
								thisProduct.endTime =
									moment(
										`${thisDate} ${oneDateVenueProductInstance.endtime}`,
									).format('HH:mm');
							}
							// if this product has a remaining capacity
							if (oneDateVenueProductInstance.instock) {
								// set value on this product
								thisProduct.remaining =
									oneDateVenueProductInstance.instock;
							}
							// if this product is for schools only
							if (oneDateVenueProductInstance.schoolonly === '1') {
								// set corresponding flag on this product
								thisProduct.schoolOnly = true;
							}
							// push to products this date container
							validProductsThisDate.push(thisProduct);
						}
					});
				}
			});
		});
		// sort this date's products by time, ascending
		validProductsThisDate.sort(
			module.exports.ReturnObjectStartTimePropertyWeightRelativeToAnother,
		);
		// return container of products for this date
		return validProductsThisDate;
	},
	
	UpsertOneScheduleDate: (oneDaySchedule) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the docs specified above
			DataConnection.get('productsSchedules')
				.findOneAndUpdate(
					{ dateString: oneDaySchedule.dateString },
					{
						$set: {
							hours: oneDaySchedule.hours,
							products: oneDaySchedule.products,
						},
					},
					{
						returnOriginal: false,
						replaceOne: true,
					},
				)
				.then((upsertResult) => {
					// resolve this promise with the result
					resolve(upsertResult);
				})
				// if the promise is rejected with an error
				.catch((upsertError) => {
					// reject this promise with an error
					reject(upsertError);
				});
		}),

	UpdateMOSScheduleData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get fresh schedule data
			module.exports.ReturnMOSSchedule()
				// if the promise is resolved with a result
				.then((scheduleResult) => {
					// set up a container for upsert promises
					const upsertPromisesContainer = [];
					// for each element in schedule result array
					scheduleResult.forEach((oneDaySchedule) => {
						// push to promise container a promise to 
						// 		upsert the doc for this date
						upsertPromisesContainer.push(
							module.exports.UpsertOneScheduleDate(oneDaySchedule),
						);
					});
					// when all upsert promises have been fulfilled
					Promise.all(upsertPromisesContainer)
						// if the promises were resolved with a result
						.then((upsertResults) => {
							// then resolve this promise with a simple message
							resolve(`successful upsert at ${moment().format()}`);
						})
						// if the promise is rejected with an error
						.catch((upsertError) => {
							// reject this promise with the error
							reject(upsertError);
						});
				})
				// if the promise is rejected with an error
				.catch((scheduleError) => {
					// reject this promise with the error
					reject(scheduleError);
				});
		}),

	ReturnDateIsInSchedule: (dateString) =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get the docs specified above
			DataConnection.get('productsSchedules')
				.findOne(
					{ dateString1: dateString },
				)
				.then((queryResult) => {
					// if a doc was found
					if (queryResult && queryResult._id) {
						// resolve this promise with true
						resolve(true);
					// if a doc wasn't found
					} else {
						// resolve this promise with false
						resolve(false);
					}
				})
				// if the promise is rejected with an error
				.catch((queryError) => {
					// reject this promise with an error
					reject(queryError);
				});
		}),

	ReplaceMOSScheduleData: () =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to get fresh schedule data
			module.exports.ReturnMOSSchedule()
				// if the promise is resolved with a result
				.then((scheduleResult) => {
					// get a promise to delete all schedule dates
					DataQueries.DeleteAllDocsFromCollection(
						'productsSchedules',
					)
						// if the promise was resolved with a result
						.then((deletionResult) => {
							// get a promise to insert all schedule dates
							DataQueries.InsertDocIntoCollection(
								scheduleResult,
								'productsSchedules',
							)
								// if the promise was resolved with a result
								.then((insertResults) => {
									// then resolve this promise with a simple message
									resolve(`successful insert at ${moment().format()}`);
								})
								// if the promise is rejected with an error
								.catch((insertError) => {
									// reject this promise with the error
									reject(insertError);
								});
						})
						// if the promise is rejected with an error
						.catch((deletionError) => {
							// reject this promise with the error
							reject(deletionError);
						});
				})
				// if the promise is rejected with an error
				.catch((scheduleError) => {
					// reject this promise with the error
					reject(scheduleError);
				});
		}),

	// --- UTILITIES


	ReturnObjectWeightPropertyWeightRelativeToAnother: (a, b) => {
		if (a.weight < b.weight) {
			return -1;
		}
		if (a.weight > b.weight) {
			return 1;
		}
		return 0;
	},


	ReturnObjectDatePropertyWeightRelativeToAnother: (a, b) => {
		if (a.date < b.date) {
			return -1;
		}
		if (a.date > b.date) {
			return 1;
		}
		return 0;
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

	ReturnTritonDataScrubRegularExpression: () => new RegExp(/[\x00-\x1F\x7F-\xFF\uFFFD]/g),
};
