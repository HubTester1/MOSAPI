// eslint-disable-next-line import/no-extraneous-dependencies
const slsw = require('serverless-webpack');

module.exports = {
	entry: slsw.lib.entries,
	target: 'node',
};
