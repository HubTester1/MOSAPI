
// ----- PULL IN MODULES

const monk = require('monk');

const connectTimeoutMS = 30000;
const socketTimeoutMS = 30000;


// ----- EXPORT DB CONNECTION

module.exports = monk(`${process.env.dbUser}:${process.env.dbPass}@${process.env.dbHost}:${process.env.dbPort}/${process.env.dbName}?connectTimeoutMS=${connectTimeoutMS}&socketTimeoutMS=${socketTimeoutMS}`);
