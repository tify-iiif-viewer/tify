const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const pkg = require('../package.json');

const env = process.env.NODE_ENV === 'testing'
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
	plugins: [
		// http://vuejs.github.io/vue-loader/en/workflow/production.html
		new webpack.DefinePlugin({
			'process.env': env,
		}),
		// TIFY-specific: Prepend copyright notice to each compiled file
		/* eslint-disable function-paren-newline */
		new webpack.BannerPlugin(
			`TIFY v${pkg.version}\n`
			+ `(c) ${new Date().getFullYear()} ${pkg.author}\n`
			+ `${pkg.license}\n`
			+ `${pkg.homepage}` // eslint-disable-line comma-dangle
		),
		// UglifyJS do not support ES6+, you can also use babel-minify for better treeshaking: https://github.com/babel/minify
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
			parallel: true,
			sourceMap: true,
		}),
		// Extract css into its own file
		new ExtractTextPlugin({
			filename: utils.assetsPath('[name].css'),
			// Set the following option to `true` if you want to extract CSS from
			// codesplit chunks into this main css file as well.
			// This will result in *all* of your app's CSS being loaded upfront.
			allChunks: false,
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
if (process.env.NODE_ENV === 'testing') {
	webpackConfig.plugins.push(
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'index.html',
			inject: true,
		}) // eslint-disable-line comma-dangle
	);
}

module.exports = webpackConfig;
