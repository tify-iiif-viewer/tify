/* eslint-disable import/no-extraneous-dependencies */

const merge = require('webpack-merge');
const devEnv = require('./dev.env');

module.exports = merge(devEnv, {
	NODE_ENV: '"testing"',
});

