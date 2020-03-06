
// ----- PULL IN MODULES

const nesoDBQueries = require('./nesoDBQueries');
const nesoUtilities = require('./nesoUtilities');


// ----- DEFINE HEALTH FUNCTIONS

module.exports = {

	Log: doc =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// clone param and add datetime
			const docClone = {
				process: doc.process,
				datetime: nesoUtilities.ReturnFormattedDateTime({
					incomingDateTimeString: 'nowLocal',
					incomingFormat: null,
					incomingReturnFormat: null,
					determineYearDisplayDynamically: 0,
				}),
				status: doc.status,
				result: doc.result,
			};
			// get a promise to docClone into cronLog collection
			nesoDBQueries.InsertDocIntoCollection(docClone, 'cronLog')
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

};
