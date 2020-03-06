
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const router = require('express').Router();
const hcGetItDone = require('../neso_modules/nesoHcGetItDone');

// ----- CONFIG EXPRESS ROUTER

// for GET request for /
router.get('/', (req, res, next) => {
	// respond with a simple message
	res.send("Ain't nothin' here.");
});

// for GET request for /check
router.get('/settings', (req, res, next) => {
	// get a promise to retrieve health status data
	hcGetItDone.ReturnHcGetItDoneSettingsData()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /check
router.get('/allItems', (req, res, next) => {
	// get a promise to retrieve health status data
	hcGetItDone.ReturnAllHcGetItDoneItems()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
