
// ----- PULL IN EXPRESS, GET EXPRESS ROUTER

const router = require('express').Router();

// ----- CONFIG EXPRESS ROUTER

// for GET request for top level directory, tell router to...
router.get('/', (req, res, next) => {
	// set the response to a render of the index view (with options)
	res.render('index', { title: 'Hey, This is Neso' });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
