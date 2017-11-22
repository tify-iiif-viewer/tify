// Based on template version 1.2.4
// See http://vuejs-templates.github.io/webpack for documentation

const path = require('path');

module.exports = {
	dev: {
		// Paths
		assetsSubDirectory: 'static',
		proxyTable: {},

		// Various Dev Server settings
		host: 'localhost', // Can be overwritten by process.env.HOST
		port: 8080, // Can be overwritten by process.env.HOST, if port is in use, a free one will be determined
		autoOpenBrowser: false,
		errorOverlay: true,
		notifyOnErrors: true,
		poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

		// Use Eslint Loader?
		// If true, your code will be linted during bundling and
		// linting errors and warings will be shown in the console.
		useEslint: true,
		// If true, eslint errors and warings will also be shown in the error overlay
		// in the browser.
		showEslintErrorsInOverlay: false,

		/**
		 * Source Maps
		 */

		// https://webpack.js.org/configuration/devtool/#development
		devtool: 'eval-source-map',

		// CSS Sourcemaps off by default because relative paths are "buggy"
		// with this option, according to the CSS-Loader README
		// (https://github.com/webpack/css-loader#sourcemaps)
		// In our experience, they generally work as expected,
		// just be aware of this issue when enabling this option.
		cssSourceMap: false,

		// If you have problems debugging vue-files in devtools,
		// set this to false - it *may* help
		// https://vue-loader.vuejs.org/en/options.html#cachebusting
		cacheBusting: true,
	},

	build: {
		// Paths
		assetsRoot: path.resolve(__dirname, '../dist'),
		assetsSubDirectory: '',

		/**
		 * Source Maps
		 */

		productionSourceMap: false,
		// https://webpack.js.org/configuration/devtool/#production
		devtool: '#source-map',

		productionGzip: false,

		// Run the build command with an extra argument to
		// View the bundle analyzer report after build finishes:
		// `npm run build --report`
		// Set to `true` or `false` to always turn it on or off
		bundleAnalyzerReport: process.env.npm_config_report,
	},
};
