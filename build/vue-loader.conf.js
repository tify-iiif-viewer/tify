/* eslint-disable import/no-extraneous-dependencies */

const utils = require('./utils');
const config = require('../config');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	loaders: utils.cssLoaders({
		sourceMap: isProduction
			? config.build.productionSourceMap
			: config.dev.cssSourceMap,
		extract: isProduction,
	}),
	// https://github.com/vuejs-templates/webpack/issues/421#issuecomment-284322065
	postcss: [
		require('postcss-import')(),
		require('autoprefixer')(),
	],
	transformToRequire: {
		video: 'src',
		source: 'src',
		img: 'src',
		image: 'xlink:href',
	},
};
