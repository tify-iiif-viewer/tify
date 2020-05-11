const BannerPlugin = require('webpack/lib/BannerPlugin.js');
const env = require('./package.json');

const info = {
	VERSION: env.version,
	AUTHOR: env.author,
	LICENSE: env.license,
	REPOSITORY_URL: env.repository.url,
	BUGS_URL: env.bugs.url,
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
							+ `(c) ${new Date().getFullYear()} ${env.author.name} (${env.author.url})\n`
							+ `${env.license}\n`
							+ `${env.homepage}` // eslint-disable-line comma-dangle
			),
		],
	},
	css: {
		extract: {
			filename: '[name].css',
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
};
