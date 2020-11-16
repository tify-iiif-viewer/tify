const BannerPlugin = require('webpack/lib/BannerPlugin.js');
const globImporter = require('node-sass-glob-importer');

const env = require('./package.json');

const info = {
	VERSION: env.version,
	LICENSE: env.license,
	REPOSITORY_URL: env.repository.url,
	CONTRIBUTORS_URL: "https://github.com/tify-iiif-viewer/tify/blob/main/CONTRIBUTORS.md",
	DOCS_URL: `${env.repository.url}/blob/v${env.version}/doc`,
};

process.env.VUE_APP_INFO = escape(JSON.stringify(info));

module.exports = {
	configureWebpack: {
		optimization: {
			splitChunks: false,
		},
		output: {
			filename: '[name].js',
		},
		plugins: [
			// TIFY-specific: Prepend copyright notice to each compiled file
			/* eslint-disable function-paren-newline */
			new BannerPlugin(
				`TIFY v${env.version}\n`
							+ `(c) 2017-${new Date().getFullYear()} Göttingen State and University Library (https://www.uni-goettingen.de/en/)\n`
							+ `${env.license}\n`
							+ `${env.homepage}` // eslint-disable-line comma-dangle
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
