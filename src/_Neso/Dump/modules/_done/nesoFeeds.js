
// ----- PULL IN MODULES

const fse = require('fs-extra');
const util = require('util');
const xml2js = require('xml2js');
const he = require('he');

const heOptions = {
	useNamedReferences: true,
};
const parser = new xml2js.Parser();


// ----- DEFINE FEEDS FUNCTIONS

module.exports = {

	CreateProductsXMLFeed: filename =>
		// return a new promise
		new Promise((resolve, reject) => {
			// retrieve JSON
			fse.readFile(`${process.env.appRoot}\\public\\feeds\\products\\${filename}.json`, 'utf8', (readFileError, readFileData) => {
				if (readFileError) {
					console.log('readFileError');
					console.log(readFileError);
					reject(readFileError);
				} else {
					let xmlString = 
					`<products>
					`;
					const source = JSON.parse(readFileData);
					const venueSourceArray = source.venues;
					venueSourceArray.forEach((venue, venueIndex) => {
						let thisVenueString = 
							`<venue>
								<title>${he.encode(venue.title, heOptions)}</title>
								<memberonly>${venue.memberonly}</memberonly>
								<capacity>${venue.capacity}</capacity>
								<shows>
							`;
						const showSourceArray = venue.shows;
						showSourceArray.forEach((show, showIndex) => {
							let thisShowString = 
								`		<show>
										<title>${he.encode(show.title, heOptions)}</title>
										<location>${he.encode(show.location, heOptions)}</location>
										<length>${show.length}</length>
										<eventnumber>${show.eventnumber}</eventnumber>
								`;
							const dateSourceArray = show.dates;
							dateSourceArray.forEach((date, dateIndex) => {
								let thisDateString = 
									`		<date>
										<eventdate>${date.eventdate}</eventdate>
										<times>
									`;
								
								const timeSourceArray = date.times;
								timeSourceArray.forEach((time, timeIndex) => {
									let thisTimeString =
										`		<time>
										<starttime schooolonly="${time.starttime.schoolonly}">${time.starttime.timestring}</starttime>
										<endtime schooolonly="${time.endtime.schoolonly}">${time.endtime.timestring}</endtime>
										<instock>${time.instock}</instock>
										`;

									thisTimeString +=
										`	</time>
										`;
									thisDateString += thisTimeString;
								});


								thisDateString +=
									`	</times>
										</date>
									`;
								thisShowString += thisDateString;
							});

							thisShowString += 
								`	</show>
								`;
							thisVenueString += thisShowString;
						});
						thisVenueString += 
							`	</shows>
							</venue>
							`;
						xmlString += thisVenueString;
					});


					xmlString += '</products>';
					fse.writeFile(`${process.env.appRoot}\\public\\feeds\\products\\${filename}.xml`, xmlString, (writeFileError) => {
						if (writeFileError) {
							console.log(writeFileError);
						}
						console.log('XML file was saved!');
					});
					resolve(xmlString);
				}
			});
		}),

	CreateProductsJSONFeed: filename =>
		// return a new promise
		new Promise((resolve, reject) => {
			// get a promise to retrieve xml contents as JS
			module.exports.ReturnXMLAsJSFromFile(`\\\\zeus\\shared\\Hubdata\\iit\\products\\${filename}.xml`)
				// if the promise is resolved with the data, then resolve this promise with the data
				.then((xmlAsJSResult) => {
					const source = xmlAsJSResult.xmlAsJS.products;
					const feedObject = {
						venues: [],
					};
					const venuesObject = {};
					const capacityStrings = {
						'4-D Theater': 98,
						'Butterfly Garden': 30,
						'Charles Hayden Planetarium': 209,
						'Drop-In Activities': 30000,
						'Live Presentations': 30000,
						'Mugar Omni Theater': 364,
						'School Lunch': 200,
					};
					const venueSourceArray = source.venue;
					// console.log(util.inspect(venueArray, false, null));
					venueSourceArray.forEach((venue, venueIndex) => {
						if (!venuesObject[venue.title[0]]) {
							venuesObject[venue.title[0]] = {
								title: venue.title[0],
								memberonly: venue.memberonly[0],
								capacity: capacityStrings[venue.title[0]],
								showsObject: {},
							};
						}
						const showSourceArray = venue.shows[0].show;
						showSourceArray.forEach((show, showIndex) => {
							if (!venuesObject[venue.title[0]].showsObject[show.eventnumber[0]]) {
								venuesObject[venue.title[0]].showsObject[show.eventnumber[0]] = {
									title: show.title[0],
									location: show.location[0],
									length: show.length[0],
									eventnumber: show.eventnumber[0],
									datesObject: {},
								};
							}
							const dateSourceArray = show.date;
							dateSourceArray.forEach((date, dateIndex) => {
								if (!venuesObject[venue.title[0]].showsObject[show.eventnumber[0]].datesObject[date.eventdate[0]]) {
									venuesObject[venue.title[0]].showsObject[show.eventnumber[0]].datesObject[date.eventdate[0]] = {
										eventdate: date.eventdate[0],
										timesArray: [],
									};
								}
								const timeSourceArray = date.times[0].time;
								timeSourceArray.forEach((time, timeIndex) => {
									venuesObject[venue.title[0]].showsObject[show.eventnumber[0]].datesObject[date.eventdate[0]].timesArray.push({
										starttime: {
											schoolonly: time.starttime[0].$.schoolonly,
											timestring: time.starttime[0]._,
										},
										endtime: {
											schoolonly: time.endtime[0].$.schoolonly,
											timestring: time.endtime[0]._,
										},
										instock: time.instock[0],
									});
								});
							});
						});
					});
					const venuesObjectKeys = Object.keys(venuesObject);
					venuesObjectKeys.forEach((venuesObjectKey, venuesObjectKeyIndex) => {
						const thisVenueFromObject = venuesObject[venuesObjectKey];
						const thisVenueForFeed = {
							title: thisVenueFromObject.title,
							memberonly: thisVenueFromObject.memberonly,
							capacity: thisVenueFromObject.capacity,
							shows: [],
						};
						const showsObjectKeys = Object.keys(thisVenueFromObject.showsObject);
						showsObjectKeys.forEach((showsObjectKey, showsObjectKeyIndex) => {
							const thisShowFromObject = thisVenueFromObject.showsObject[showsObjectKey];
							const thisShowForFeed = {
								title: thisShowFromObject.title,
								location: thisShowFromObject.location,
								length: thisShowFromObject.length,
								eventnumber: thisShowFromObject.eventnumber,
								dates: [],
							};
							const datesObjectKeys = Object.keys(thisShowFromObject.datesObject);
							datesObjectKeys.forEach((datesObjectKey, datesObjectKeyIndex) => {
								const thisDateFromObject = thisShowFromObject.datesObject[datesObjectKey];
								const thisDateForFeed = {
									eventdate: thisDateFromObject.eventdate,
									times: thisDateFromObject.timesArray,
								};
								thisShowForFeed.dates.push(thisDateForFeed);
							});
							thisVenueForFeed.shows.push(thisShowForFeed);
						});
						feedObject.venues.push(thisVenueForFeed);
					});
					const feedString = JSON.stringify(feedObject);
					fse.writeFile(`${process.env.appRoot}\\public\\feeds\\products\\${filename}.json`, feedString, (writeFileError) => {
						if (writeFileError) {
							console.log(writeFileError);
						}
						console.log('Feed file was saved!');
					});
					resolve(feedString);
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => {
					reject(error);
				});
		}),

	ReturnNewXMLFilePathAndName: currentFilePathAndName =>
		`${currentFilePathAndName.slice(0, currentFilePathAndName.length - 4)}Copy.xml`,

	ReturnXMLAsJSFromFile: filePathAndName =>
		// return a new promise
		new Promise((resolve, reject) => {
			// make a copy of the file to read
			const newXMLFilePathAndName =
				module.exports.ReturnNewXMLFilePathAndName(filePathAndName);
			fse
				.copy(filePathAndName, newXMLFilePathAndName, { overwrite: true })
				.then(() => {
					// console.log('FILE COPIED');
					fse.readFile(newXMLFilePathAndName, (fileReadError, fileReadData) => {
						parser.parseString(fileReadData, (parseError, parseResult) => {
							// resolve this promise with a message
							resolve({
								// error: false,
								error: parseError,
								// xmlAsJSError: false,
								xmlAsJS: parseResult,
							});
							fse
								.remove(newXMLFilePathAndName)
								.then(() => {
									// console.log('FILE REMOVED');
								})
								.catch((err) => {
									// construct a custom error
									const errorToReport = {
										error: true,
										fileRemovalError: true,
									};
									// process error
									// nesoErrors.ProcessError(errorToReport);
									// reject this promise with an error
									reject(errorToReport);
								});
						});
					});
				})
				.catch((err) => {
					// construct a custom error
					const errorToReport = {
						error: true,
						fileCopyError: true,
					};
					// process error
					// nesoErrors.ProcessError(errorToReport);
					// reject this promise with an error
					reject(errorToReport);
				});
			// if there was an error
			/* } catch (exception) {
				// console.log(exception);
				// construct a custom error
				const errorToReport = {
					error: true,
					xmlAsJSError: true,
				};
				// process error
				// nesoErrors.ProcessError(errorToReport);
				// reject this promise with an error
				reject(errorToReport);
			} */
		}),


};
