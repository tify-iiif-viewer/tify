const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.conf');
const config = require('../config');
const utils = require('./utils');

const env = process.env.NODE_ENV === 'test'
	? require('../config/test.env')
	: require('../config/prod.env');

const webpackConfig = merge(baseWebpackConfig, {
	module: {
		rules: utils.styleLoaders({
			sourceMap: config.build.productionSourceMap,
			extract: true,
			usePostCSS: true,
		}),
	},
	devtool: config.build.productionSourceMap ? '#source-map' : false,
	output: {
		path: config.build.assetsRoot,
		filename: utils.assetsPath('[name].js'),
		chunkFilename: utils.assetsPath('[name].js'),
	},
	optimization: {
		minimize: false,
	},
	plugins: [
		// http://vuejs.github.io/vue-loader/en/workflow/production.html
		new webpack.DefinePlugin({
			'process.env': env,
		}),
		// Compress extracted CSS. We are using this plugin so that possible
		// duplicated CSS from different components can be deduped.
		new OptimizeCSSPlugin({
			cssProcessorOptions: config.build.productionSourceMap
				? { safe: true, map: { inline: false } }
				: { safe: true },
		}),

		// NOTE: HtmlWebpackPlugin removed and re-added below only for testing
		// since we don't need an index.html in production.

		// Copy custom static assets
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '../static'),
				to: config.build.assetsSubDirectory,
				ignore: ['.*'],
			},
		]),
	],
});

if (config.build.bundleAnalyzerReport) {
	const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
	webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

// NOTE: This is required for E2E tests despite not being used in the build
if (process.env.NODE_ENV === 'test') {
	webpackConfig.plugins.push(
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'index.html',
			inject: true,
		}) // eslint-disable-line comma-dangle
	);
}

module.exports = webpackConfig;
