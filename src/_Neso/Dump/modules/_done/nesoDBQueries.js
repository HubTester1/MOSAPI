
// ----- PULL IN MODULES

const nesoDBConnection = require('./nesoDBConnection');
const nesoErrors = require('./nesoErrors');
const { ObjectID } = require('mongodb');

// ----- DB QUERY WRAPPER FUNCTIONS

module.exports = {

	ReturnAllDocsFromCollection: collection =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).find({}, {}, (error, docs) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						error: false,
						mongoDBError: false,
						docs,
					});
				}
			});
		})),

	ReturnLimitedDocsFromCollectionSorted: (collection, field, order, limit) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			const orderFlag = (order === 'descending') ? -1 : 1;
			// note: sortObject and projectionObject MUST be constructed in the following way;
			// 		attempts to "optimize" the relevant lines result in errors
			const sortObject = {};
			sortObject[field] = orderFlag;
			const projectionObject = {};
			projectionObject.sort = sortObject;
			if (limit) {
				projectionObject.limit = limit;
			}
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection)
				.find({}, projectionObject, (error, docs) => {
					// if there was an error
					if (error) {
						// construct a custom error
						const errorToReport = {
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						};
						// add error to Twitter
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
						// if there was NOT an error
					} else {
						// resolve the promise and return the docs
						resolve({
							error: false,
							mongoDBError: false,
							docs,
						});
					}
				});
		})),


	ReturnAllDocsFromCollectionSorted: (collection, field, order) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			const orderFlag = (order === 'descending') ? -1 : 1;
			// note: sortObject and projectionObject MUST be constructed in the following way;
			// 		attempts to "optimize" the relevant lines result in errors
			const sortObject = {};
			sortObject[field] = orderFlag;
			const projectionObject = {};
			projectionObject.sort = sortObject;
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection)
				.find({}, projectionObject, (error, docs) => {
					// if there was an error
					if (error) {
						// construct a custom error
						const errorToReport = {
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						};
						// add error to Twitter
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
						// if there was NOT an error
					} else {
						// resolve the promise and return the docs
						resolve({
							error: false,
							mongoDBError: false,
							docs,
						});
					}
				});
		})),

	ReturnSpecifiedDocsFromCollectionSorted: (collection, queryObject, sortField, order) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			const orderFlag = (order === 'descending') ? -1 : 1;
			// note: sortObject MUST be constructed in the following way; 
			// 		attempts to "optimize" the next two lines result in errors
			const sortObject = {};
			sortObject[sortField] = orderFlag;
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection)
				.find(queryObject, { sort: sortObject }, (error, docs) => {
					// if there was an error
					if (error) {
						// construct a custom error
						const errorToReport = {
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						};
						// add error to Twitter
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
						// if there was NOT an error
					} else {
						// resolve the promise and return the docs
						resolve({
							error: false,
							mongoDBError: false,
							docs,
						});
					}
				});
		})),

	ReturnAllSpecifiedDocsFromCollection: (collection, query, projection) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).find(query, projection, (error, docs) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						error: false,
						mongoDBError: false,
						docs,
					});
				}
			});
		})),

	ReturnFirstDocFromCollection: collection =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).findOne({}, {}, (error, docs) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						error: false,
						mongoDBError: false,
						docs,
					});
				}
			});
		})),

	ReturnOneSpecifiedDocFromCollection: (collection, query, projection) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).findOne(query, projection, (error, docs) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						error: false,
						mongoDBError: false,
						docs,
					});
				}
			});
		})),

	ReturnOneRandomSampleFromSpecifiedDocsFromCollection: (collection, query) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection)
				.aggregate([{ $match: query }, { $sample: { size: 1 } }], (error, docs) => {
					// if there was an error
					if (error) {
						// construct a custom error
						const errorToReport = {
							error: true,
							mongoDBError: true,
							mongoDBErrorDetails: error,
						};
						// add error to Twitter
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
						// if there was NOT an error
					} else {
						// resolve the promise and return the docs
						resolve({
							error: false,
							mongoDBError: false,
							docs,
						});
					}
				});
		})),

	InsertDocIntoCollection: (doc, collection) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).insert(doc, (error, result) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the result
					resolve({
						error: false,
						mongoDBError: false,
						docs: result,
					});
				}
			});
		})),

	OverwriteDocInCollection: (docID, doc, collection) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).update({ _id: docID }, doc, (error, countsFromMonk) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the counts of what happened
					const docCounts = {};
					if (typeof (countsFromMonk.n) !== 'undefined') { docCounts.matchedDocs = countsFromMonk.n; }
					if (typeof (countsFromMonk.nModified) !== 'undefined') { docCounts.modifiedDocs = countsFromMonk.nModified; }
					resolve({
						error: false,
						mongoDBError: false,
						docCounts,
					});
				}
			});
		})),

	UpdateSpecificFieldInSpecificDocsInCollection:
		(
			collection,
			docsSelectionFieldName,
			docsSelectionFieldValue,
			docsSelectorIsDocID,
			changingFieldName,
			changingFieldNewValue,
		) =>
			// return a new promise
			new Promise(((resolve, reject) => {
				// note: setObject MUST be constructed in the following way; 
				// 		attempts to "optimize" the next two lines result in errors
				const setObject = {};
				setObject[changingFieldName] = changingFieldNewValue;

				// note: setObject MUST be constructed in the following way; 
				// 		attempts to "optimize" the next two lines result in errors
				const selectionObject = {};
				if (docsSelectorIsDocID) {
					selectionObject[docsSelectionFieldName] = ObjectID(docsSelectionFieldValue);
				} else {
					selectionObject[docsSelectionFieldName] = docsSelectionFieldValue;
				}


				// use nesoDBConnection object to query db
				nesoDBConnection.get(collection).update(
					selectionObject,
					{ $set: setObject },
					(error, countsFromMonk) => {
						// if there was an error
						if (error) {
							// construct a custom error
							const errorToReport = {
								error: true,
								mongoDBError: true,
								mongoDBErrorDetails: error,
							};
							// add error to Twitter
							nesoErrors.ProcessError(errorToReport);
							// reject this promise with the error
							reject(errorToReport);
							// if there was NOT an error
						} else {
							// resolve the promise and return the counts of what happened
							const docCounts = {};
							if (countsFromMonk.n) { docCounts.matchedDocs = countsFromMonk.n; }
							if (countsFromMonk.nModified) { docCounts.modifiedDocs = countsFromMonk.nModified; }
							resolve({
								error: false,
								mongoDBError: false,
								docCounts,
							});
						}
					},
				);
			})),
	UpdateSpecificFieldsInSpecificDocsInCollection:
		(
			collection,
			docsSelectionFieldName,
			docsSelectionFieldValue,
			docsSelectorIsDocID,
			changingFieldsArray,
		) =>
			// return a new promise
			new Promise(((resolve, reject) => {
				// note: setObject MUST be constructed in the following way; 
				// 		attempts to "optimize" the next two lines result in errors
				const setObject = {};
				changingFieldsArray.forEach((changingField) => {
					setObject[changingField.key] = changingField.value;
				});

				// note: setObject MUST be constructed in the following way; 
				// 		attempts to "optimize" the next two lines result in errors
				const selectionObject = {};
				if (docsSelectorIsDocID) {
					selectionObject[docsSelectionFieldName] = ObjectID(docsSelectionFieldValue);
				} else {
					selectionObject[docsSelectionFieldName] = docsSelectionFieldValue;
				}
				// use nesoDBConnection object to query db
				nesoDBConnection.get(collection).update(
					selectionObject,
					{ $set: setObject },
					(error, countsFromMonk) => {
						// if there was an error
						if (error) {
							// construct a custom error
							const errorToReport = {
								error: true,
								mongoDBError: true,
								mongoDBErrorDetails: error,
							};
							// add error to Twitter
							nesoErrors.ProcessError(errorToReport);
							// reject this promise with the error
							reject(errorToReport);
							// if there was NOT an error
						} else {
							// resolve the promise and return the counts of what happened
							const docCounts = {};
							if (countsFromMonk.n) { docCounts.matchedDocs = countsFromMonk.n; }
							if (countsFromMonk.nModified) { docCounts.modifiedDocs = countsFromMonk.nModified; }
							resolve({
								error: false,
								mongoDBError: false,
								docCounts,
							});
						}
					},
				);
			})),
	DeleteDocFromCollection: (docID, collection) =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).remove({ _id: docID }, (error, resultFromMonk) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the counts of what happened
					const docCounts = {};
					if (typeof (resultFromMonk.result.n) !== 'undefined') { docCounts.matchedDocs = resultFromMonk.result.n; }
					if (typeof (resultFromMonk.result.ok) !== 'undefined') { docCounts.deletedDocs = resultFromMonk.result.ok; }
					resolve({
						error: false,
						mongoDBError: false,
						docCounts,
					});
				}
			});
		})),

	DeleteAllDocsFromCollection: collection =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// use nesoDBConnection object to query db
			nesoDBConnection.get(collection).remove({}, (error, resultFromMonk) => {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						error: true,
						mongoDBError: true,
						mongoDBErrorDetails: error,
					};
					// add error to Twitter
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the counts of what happened
					const docCounts = {};
					if (typeof (resultFromMonk.result.n) !== 'undefined') { docCounts.matchedDocs = resultFromMonk.result.n; }
					if (typeof (resultFromMonk.result.ok) !== 'undefined') { docCounts.deletedDocs = resultFromMonk.result.ok; }
					resolve({
						error: false,
						mongoDBError: false,
						docCounts,
					});
				}
			});
		})),
};
