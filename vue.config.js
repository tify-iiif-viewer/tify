const BannerPlugin = require('webpack/lib/BannerPlugin.js');
const globImporter = require('node-sass-glob-importer');

const env = require('./package.json');

process.env.VUE_APP_VERSION = env.version;
process.env.VUE_APP_LICENSE = env.license;
process.env.VUE_APP_BUGS_URL = env.bugs.url;
process.env.VUE_APP_CONTRIBUTORS_URL = 'https://github.com/tify-iiif-viewer/tify/blob/main/CONTRIBUTORS.md';
process.env.VUE_APP_DOCS_URL = `${env.repository.url}/blob/v${env.version}/doc`;
process.env.VUE_APP_REPOSITORY_URL = env.repository.url;

module.exports = {
	chainWebpack: config => {
		config.module.rule('eslint')
			.use('eslint-loader')
			.options({ fix: true })
	},
	configureWebpack: {
		optimization: {
			splitChunks: false,
		},
		output: {
			filename: '[name].js',
		},
		plugins: [
			// Prepend copyright notice to each compiled file
			new BannerPlugin(
				`TIFY v${env.version}`
					+ `\n(c) 2017-${new Date().getFullYear()}`
					+ ' Göttingen State and University Library (https://www.sub.uni-goettingen.de/en/)'
					+ `\n${env.license}`
					+ `\n${env.homepage}` // eslint-disable-line comma-dangle
			),
		],
	},
	css: {
		extract: {
			filename: '[name].css',
		},
		loaderOptions: {
			scss: {
				sassOptions: {
					importer: globImporter(),
				},
			},
		},
	},
	filenameHashing: false,
	pages: {
		tify: {
			entry: 'src/main.js',
			filename: 'index.html',
		},
	},
	productionSourceMap: false,
	devServer: {
		port: process.env.NODE_ENV === 'test' ? 8888 : 8080,
	},
};
