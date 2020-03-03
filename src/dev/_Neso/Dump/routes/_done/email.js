
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const router = require('express').Router();
const nesoEmail = require('../neso_modules/nesoEmail');

// ----- CONFIG EXPRESS ROUTER

// for GET request for /
router.get('/', (req, res, next) => {
	// respond with a simple message
	res.send("Ain't nothin' here.");
});

// for GET requests for /admin
router.get('/admin', (req, res) => {
	// respond with a render of the email/adminConsole view
	res.render('email/adminConsole', { title: 'Email Admin Console' });
});

// for GET requests for /documentation
router.get('/documentation', (req, res) => {
	// respond with a render of the adminEmail view
	res.render('email/documentation', { title: 'Email Documentation' });
});

// for GET requests for /queue
router.get('/queue', (req, res) => {
	// get a promise to retrieve all queued emails' data
	nesoEmail.ReturnEmailQueueData()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /archive
router.get('/archive', (req, res) => {
	// get a promise to retrieve all archived emails' data
	nesoEmail.ReturnEmailArchiveData()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /settings
router.get('/settings', (req, res) => {
	// get a promise to retrieve settings data
	nesoEmail.ReturnEmailSettingsData()
		// if the promise is resolved with the settings object, 
		// 		then respond with the settings object as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /settings/transporter
router.get('/settings/transporter', (req, res) => {
	// get a promise to retrieve email transporter setting
	nesoEmail.ReturnEmailTransporterOptions()
		// if the promise is resolved with the settings, then respond with the settings as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /settings/smtpProcessing
router.get('/settings/smtpProcessing', (req, res) => {
	// get a promise to retrieve email smtp processing setting
	nesoEmail.ReturnEmailSMTPProcessingStatus()
		// if the promise is resolved with the setting, then respond with the setting as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /settings/queueProcessing
router.get('/settings/queueProcessing', (req, res) => {
	// get a promise to retrieve email queue processing setting
	nesoEmail.ReturnEmailQueueProcessingStatus()
		// if the promise is resolved with the setting, then respond with the setting as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /settings/whitelistedDomains
router.get('/settings/whitelistedDomains', (req, res) => {
	// get a promise to retrieve email queue processing setting
	nesoEmail.ReturnEmailWhitelistedDomains()
		// if the promise is resolved with the setting, then respond with the setting as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /verify
router.get('/verify', (req, res) => {
	// get a promise to verify that SMTP server 
	// 		will accept messages from requester using Neso configuration
	nesoEmail.VerifySMTP()
		// if the promise is resolved with a message, then respond with the message as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for GET requests for /queue/process
router.get('/queue/process', (req, res) => {
	// get a promise to retrieve all queued emails' data
	nesoEmail.ProcessEmailQueue()
		// if the promise is resolved with the docs, then respond with the docs as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for POST requests for /queue
router.post('/queue', (req, res) => {
	// get a promise to insert the email (request body) into the queue
	nesoEmail.AddEmailToQueue(req.body)
		// if the promise is resolved with the result, then respond with the result as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for POST requests for /archive
router.post('/archive', (req, res) => {
	// get a promise to insert the email (request body) into the queue
	nesoEmail.AddEmailToArchive(req.body)
		// if the promise is resolved with the result, then respond with the result as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for POST requests for /send
router.post('/send', (req, res) => {
	// get a promise to insert the email (request body) into the queue
	nesoEmail.SendEmail(req.body)
		// if the promise is resolved with the result, then respond with the result as JSON
		.then((result) => { res.json(result); });
});

// for PUT requests for /queue/:id
router.put('/queue/:id', (req, res) => {
	// get a promise to replace the queued email with the modified email (req.body)
	nesoEmail.ReplaceQueuedEmail(req.params.id, req.body)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for PUT requests for /archive/:id
router.put('/archive/:id', (req, res) => {
	// get a promise to replace the queued email with the modified email (req.body)
	nesoEmail.ReplaceArchivedEmail(req.params.id, req.body)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for PUT requests for /settings
router.put('/settings', (req, res) => {
	// get a promise to replace the existing settings with the modified settings (req.body)
	nesoEmail.ReplaceAllEmailSettings(req.body)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for PUT requests for /settings/smtpProcessing
router.put('/settings/smtpProcessing', (req, res) => {
	// get a promise to replace the existing settings with the modified settings (req.body)
	nesoEmail.ReplaceOneEmailSetting(req.body)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for PUT requests for /settings/queueProcessing
router.put('/settings/queueProcessing', (req, res) => {
	// get a promise to replace the existing settings with the modified settings (req.body)
	nesoEmail.ReplaceOneEmailSetting(req.body)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for PUT requests for /settings/transporter
router.put('/settings/transporter', (req, res) => {
	// get a promise to replace the existing settings with the modified settings (req.body)
	nesoEmail.ReplaceOneEmailSetting(req.body)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for DELETE requests for /queue/:id, tell router to...
router.delete('/queue/:id', (req, res) => {
	// get a promise to delete the queued email
	nesoEmail.DeleteQueuedEmail(req.params.id)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// for DELETE requests for /queue/:id, tell router to...
router.delete('/archive/:id', (req, res) => {
	// get a promise to delete the queued email
	nesoEmail.DeleteQueuedEmail(req.params.id)
		// if the promise is resolved with the counts, then respond with the counts as JSON
		.then((result) => { res.json(result); })
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
