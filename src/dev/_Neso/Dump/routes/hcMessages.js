
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const router = require('express').Router();
const hcMessages = require('../neso_modules/nesoHcMessages');

// ----- CONFIG EXPRESS ROUTER

// for GET request for /
router.get('/', (req, res, next) => {
	// respond with a simple message
	res.send("Ain't nothin' here.");
});

// for GET request for /settings
router.get('/settings', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessagesSettingsData()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /messages
router.get('/messages', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessages()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /nextMessageID
router.get('/nextMessageID', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessagesNextMessageIDAndIterate()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /descending
router.get('/descending', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessagesDescending()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /descending/limit3
router.get('/descending/limit3', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessagesDescendingLimit3()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /descending/limit4
router.get('/descending/limit4', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessagesDescendingLimit4()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET request for /descending
router.get('/descending/tagged/:name/:camlName', (req, res, next) => {
	// get a promise to retrieve health status data
	hcMessages.ReturnHcMessagesDescendingWithSpecifiedTag(req.params.name, req.params.camlName)
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for POST requests for /addMessage
router.post('/addMessage', (req, res) => {
	// get a promise to insert the email (request body) into the queue
	hcMessages.ProcessNewMessage(req.body)
		// if the promise is resolved with the result, then respond with the result as JSON
		.then((result) => { res.json(result); });
});

// for POST requests for /addMessage
router.post('/addMessageImages', (req, res) => {
	// get a promise to insert the email (request body) into the queue
	hcMessages.ProcessNewMessageImages(req)
		// if the promise is resolved with the result, then respond with the result as JSON
		.then((result) => { res.json(result); });
});

// for POST requests for /addMessage
router.post('/updateMessage', (req, res) => {
	// get a promise to insert the email (request body) into the queue
	hcMessages.ProcessMessageUpdate(req.body)
		// if the promise is resolved with the result, then respond with the result as JSON
		.then((result) => { res.json(result); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
