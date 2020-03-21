/**
 * @name People
 * @cron
 * @description Perform all cron jobs to retrieve and process data for People API
 */

const DataQueries = require('data-queries');
const UltiPro = require('ultipro');
const MSGraph = require('ms-graph');
const Utilities = require('utilities');
const axios = require('axios');
const Response = require('response');

module.exports.ProcessAllPeopleData();
