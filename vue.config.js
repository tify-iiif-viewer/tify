const BannerPlugin = require('webpack/lib/BannerPlugin.js');
const env = require('./package.json');

const info = {
	VERSION: env.version,
	LICENSE: env.license,
	REPOSITORY_URL: env.repository.url,
	BUGS_URL: env.bugs.url,
	DOCS_URL: `${env.repository.url}/blob/main/README.md`,
	CONTRIBUTORS: env.contributors,
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
			new BannerPlugin(
				`TIFY v${env.version}\n`
				+ `${env.license}\n`
				+ `${env.homepage}`,
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
	devServer: {
		port: process.env.NODE_ENV === 'test' ? 8888 : 8080,
	},
};
