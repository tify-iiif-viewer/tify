/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */

// NOTE: HtmlWebpackPlugin removed since we don't need an index.html in production.

const path = require('path');
const utils = require('./utils');
const webpack = require('webpack');
const config = require('../config');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const pkg = require('../package.json');

const env = process.env.NODE_ENV === 'testing'
	? require('../config/test.env')
	: config.build.env;

const webpackConfig = merge(baseWebpackConfig, {
	module: {
		rules: utils.styleLoaders({
			sourceMap: config.build.productionSourceMap,
			extract: true,
		}),
	},
	devtool: config.build.productionSourceMap ? '#source-map' : false,
	output: {
		path: config.build.assetsRoot,
		filename: utils.assetsPath('[name].js'),
		chunkFilename: utils.assetsPath('[id].js'),
	},
	plugins: [
		// http://vuejs.github.io/vue-loader/en/workflow/production.html
		new webpack.DefinePlugin({
			'process.env': env,
		}),
		// TIFY-specific: Prepend copyright notice to each compiled file
		new webpack.BannerPlugin(
			`TIFY v${pkg.version}\n`
			+ `(c) ${new Date().getFullYear()} ${pkg.author}\n`
			+ `${pkg.license}\n`
			+ `${pkg.homepage}` // eslint-disable-line comma-dangle
		),
		// UglifyJs do not support ES6+, you can also use babel-minify for better treeshaking: https://github.com/babel/minify
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
			parallel: true,
			sourceMap: true,
		}),
		// extract css into its own file
		new ExtractTextPlugin({
			filename: utils.assetsPath('[name].css'),
		}),
		// Compress extracted CSS. We are using this plugin so that possible
		// duplicated CSS from different components can be deduped.
		new OptimizeCSSPlugin({
			cssProcessorOptions: {
				safe: true, // TODO: Is this required?
			},
		}),
		// copy custom static assets
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '../static'),
				to: config.build.assetsSubDirectory,
				ignore: ['.*'],
			},
		]),
	],
});

if (config.build.productionGzip) {
	const CompressionWebpackPlugin = require('compression-webpack-plugin');

	webpackConfig.plugins.push(
		new CompressionWebpackPlugin({
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: new RegExp(`\\.(${config.build.productionGzipExtensions.join('|')})$`),
			threshold: 10240,
			minRatio: 0.8,
		}) // eslint-disable-line comma-dangle
	);
}

if (config.build.bundleAnalyzerReport) {
	const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
	webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
