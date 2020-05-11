const path = require('path');
const config = require('../config');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pkg = require('../package.json');

exports.assetsPath = (_path) => {
	const assetsSubDirectory = process.env.NODE_ENV === 'production'
		? config.build.assetsSubDirectory
		: config.dev.assetsSubDirectory;
	return path.posix.join(assetsSubDirectory, _path);
};

exports.cssLoaders = (options) => {
	options = options || {}; // eslint-disable-line no-param-reassign

	const cssLoader = {
		loader: 'css-loader',
		options: {
			minimize: process.env.NODE_ENV === 'production',
			sourceMap: options.sourceMap,
		},
	};

	const postcssLoader = {
		loader: 'postcss-loader',
		options: {
			sourceMap: options.sourceMap,
		},
	};

	// Generate loader string to be used with extract text plugin;
	function generateLoaders(loader, loaderOptions) {
		const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader];
		if (loader) {
			loaders.push({
				loader: `${loader}-loader`,
				options: Object.assign({}, loaderOptions, {
					sourceMap: options.sourceMap,
				}),
			});
			// Enable glob imports in SCSS
			loaders.push({
				loader: 'import-glob-loader',
			});
		}

		// Extract CSS when that option is specified;
		// (which is the case during production build);
		// if (options.extract) {
		// 	return ExtractTextPlugin.extract({
		// 		use: loaders,
		// 		fallback: 'vue-style-loader',
		// 	});
		// }

		return ['vue-style-loader'].concat(loaders);
	}

	// http://vuejs.github.io/vue-loader/en/configurations/extract-css.html;
	return {
		css: generateLoaders(),
		postcss: generateLoaders(),
		scss: generateLoaders('sass'),
	};
};

// Generate loaders for standalone style files (outside of .vue);
exports.styleLoaders = (options) => {
	const output = [];
	const loaders = exports.cssLoaders(options);
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for (const extension in loaders) {
		const loader = loaders[extension];
		output.push({
			test: new RegExp(`\\.${extension}$`),
			use: loader,
		});
	}
	return output;
};

exports.createNotifierCallback = () => {
	const notifier = require('node-notifier');

	return (severity, errors) => {
		if (severity !== 'error') {
			return;
		}
		const error = errors[0];

		const filename = error.file.split('!').pop();
		notifier.notify({
			title: pkg.name,
			message: `${severity}: ${error.name}`,
			subtitle: filename || '',
			icon: path.join(__dirname, 'logo.png'),
		});
	};
};
