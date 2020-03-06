
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const router = require('express').Router();
const nesoHcOrg = require('../neso_modules/nesoHcOrg');

// ----- CONFIG EXPRESS ROUTER

// for GET request for /
router.get('/', (req, res, next) => {
	// respond with a simple message
	res.send("Ain't nothin' here.");
});

// for GET request for /check
router.get('/settings', (req, res, next) => {
	// get a promise to retrieve health status data
	nesoHcOrg.ReturnHcOrgSettings()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /teams
router.get('/allTeams', (req, res, next) => {
	// get a promise to retrieve user data
	nesoHcOrg.ReturnAllTeams()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /all
router.get('/allOrg', (req, res, next) => {
	// get a promise to retrieve health status data
	nesoHcOrg.ReturnAllHcOrgData()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /all
router.get('/divDeptTeams', (req, res, next) => {
	// get a promise to retrieve health status data
	nesoHcOrg.ReturnDivDeptsWTeams()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /all
router.get('/nonDivDeptTeams', (req, res, next) => {
	// get a promise to retrieve health status data
	nesoHcOrg.ReturnNonDivDeptTeams()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
