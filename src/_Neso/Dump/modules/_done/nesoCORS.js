
// ----- PULL IN MODULES

const nesoHealth = require('./nesoHealth');
const nesoEmail = require('./nesoEmail');
const nesoHRPositions = require('./nesoHRPositions');
const nesoActiveDirectory = require('./nesoActiveDirectory');
const hcMessages = require('./nesoHcMessages');
const hcGetItDone = require('./nesoHcGetItDone');
const hcOrg = require('./nesoHcOrg');
const nesoImages = require('./nesoImages');
const nesoHubExports = require('./nesoHubExports');


// ----- HELPER FUNCTIONS, GENERAL AND BY API

module.exports = {

	RequestingDomainWhitelistedForHealthAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the health API
		nesoHealth.ReturnHealthWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => { 
				// set options by passing requesting domain and domains whitelisted for
				// 		the health APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},

	RequestingDomainWhitelistedForHcMessagesAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the health API
		hcMessages.ReturnHcMessagesWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => { 
				// set options by passing requesting domain and domains whitelisted for
				// 		the health APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},

	RequestingDomainWhitelistedForHcGetItDoneAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the health API
		hcGetItDone.ReturnHcGetItDoneWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => {
				// set options by passing requesting domain and domains whitelisted for
				// 		the health APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},

	RequestingDomainWhitelistedForHcOrgAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the health API
		hcOrg.ReturnHcOrgWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => {
				// set options by passing requesting domain and domains whitelisted for
				// 		the health APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},
	
	RequestingDomainWhitelistedForEmailAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the email API
		nesoEmail.ReturnEmailWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => { 
				// set options by passing requesting domain and domains whitelisted for the email 
				// 		APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},

	RequestingDomainWhitelistedForHRPositionsAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the 
		// 		hr positions API
		nesoHRPositions.ReturnHRPositionsWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => { 
				// set options by passing requesting domain and domains whitelisted for the 
				// 		hr positions APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},

	RequestingDomainWhitelistedForActiveDirectoryAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the ad users API
		nesoActiveDirectory.ReturnADWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => {
				// set options by passing requesting domain and domains whitelisted for 
				// 		the ad users APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions = 
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},


	RequestingDomainWhitelistedForImagesAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the images API
		nesoImages.ReturnImagesWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => {
				// set options by passing requesting domain and domains whitelisted for
				// 		the health APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},
	

	RequestingDomainInSpecifiedWhitelist: (requestingDomain, specifiedWhitelist) => {
		if (specifiedWhitelist.indexOf(requestingDomain) !== -1) {
			return { origin: true };
		} 
		return { origin: false };
	},

	RequestingDomainWhitelistedForHubExportsAPI: (req, callback) => {
		// get a promise to retrieve from the db the array of domains whitelisted for the health API
		nesoHubExports.ReturnExportWhitelistedDomains()
			// if the promise is resolved with the setting, then
			.then((setting) => {
				// set options by passing requesting domain and domains whitelisted for
				// 		the health APT to RequestingDomainInSpecifiedWhitelist
				const corsOptions =
					module.exports
						.RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
				// pass options to callback in the CORS node module so that it can do its business
				// callback expects two parameters: error and options
				callback(null, corsOptions);
			})
			// if the promise is rejected with an error, then respond with the error as JSON
			// callback expects two parameters: error and options
			.catch((error) => { callback(error, null); });
	},

};
