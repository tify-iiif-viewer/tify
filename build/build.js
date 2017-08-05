/* eslint-disable import/no-extraneous-dependencies */

require('./check-versions')();

process.env.NODE_ENV = 'production';

const ora = require('ora');
const rm = require('rimraf');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.prod.conf');

const spinner = ora('building for production...');
spinner.start();

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), (err) => {
	if (err) throw err;
	webpack(webpackConfig, (err2, stats) => {
		spinner.stop();
		if (err2) throw err2;
		process.stdout.write(`${stats.toString({
			colors: true,
			modules: false,
			children: false,
			chunks: false,
			chunkModules: false,
		})}\n\n`);

		// eslint-disable-next-line no-console
		console.log(chalk.cyan('	Build complete.\n'));
	});
});

