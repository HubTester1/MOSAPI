
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const router = require('express').Router();
const nesoActiveDirectory = require('../neso_modules/nesoActiveDirectory');

// ----- CONFIG EXPRESS ROUTER

// for GET request for /
router.get('/', (req, res, next) => {
	// respond with a simple message
	res.send("Ain't nothin' here.");
});
// for GET request for /users
router.get('/users', (req, res, next) => {
	// get a promise to retrieve user data
	nesoActiveDirectory.ReturnAllUsers()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /user/:account
router.get('/user/:account', (req, res, next) => {
	// get a promise to retrieve user data
	nesoActiveDirectory.ReturnOneUser(req.params.account)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /divDept
router.get('/divDept', (req, res, next) => {
	// get a promise to retrieve user data
	nesoActiveDirectory.ReturnAllUsersByDivisionDepartment()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /divDept
router.get('/divDept/dept/:deptName', (req, res, next) => {
	// get a promise to retrieve user data
	nesoActiveDirectory.ReturnAllUsersInDepartment(req.params.deptName)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /divDept
router.get('/divDept/div/:divName', (req, res, next) => {
	// get a promise to retrieve user data
	nesoActiveDirectory.ReturnAllUsersInDivision(req.params.divName)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /depts
router.get('/depts', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnAllDepartments()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /managers
router.get('/managers', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnAllADManagersFlat()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /manager/directReports/:account
router.get('/manager/directReports/:account', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnDirectReportsForOneManager(req.params.account)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /managers/downline/flat
router.get('/managers/downline/flat', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnAllManagersWithFlatDownline()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /managers/downline/hierarchical
router.get('/managers/downline/hierarchical', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnAllManagersWithHierarchicalDownline()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /manager/downline/flat/:account
router.get('/manager/downline/flat/:account', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnOneManagerWithFlatDownline(req.params.account)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /manager/downline/hierarchical/:account
router.get('/manager/downline/hierarchical/:account', (req, res, next) => {
	// get a promise to retrieve department data
	nesoActiveDirectory.ReturnOneManagerWithWithHierarchicalDownline(req.params.account)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});
// for GET request for /user/upline/:account
router.get('/user/upline/:account', (req, res, next) => {
	// get a promise to retrieve user data
	nesoActiveDirectory.ReturnFullFlatUplineForOneUser(req.params.account)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
