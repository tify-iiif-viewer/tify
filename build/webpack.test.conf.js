// This is the webpack config used for unit tests.

/* eslint-disable import/no-extraneous-dependencies */

const utils = require('./utils');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');

const webpackConfig = merge(baseConfig, {
	// Use inline sourcemap for karma-sourcemap-loader
	module: {
		rules: utils.styleLoaders(),
	},
	devtool: '#inline-source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env': require('../config/test.env'),
		}),
	],
});

// No need for app entry during tests
delete webpackConfig.entry;

module.exports = webpackConfig;
