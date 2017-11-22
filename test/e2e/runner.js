process.env.NODE_ENV = 'testing';

const webpack = require('webpack');
const DevServer = require('webpack-dev-server');

const webpackConfig = require('../../build/webpack.prod.conf');
const devConfigPromise = require('../../build/webpack.dev.conf');

let server;

devConfigPromise.then((devConfig) => {
	const devServerOptions = devConfig.devServer;
	const compiler = webpack(webpackConfig);
	server = new DevServer(compiler, devServerOptions);
	const { port } = devServerOptions;
	const { host } = devServerOptions;
	return server.listen(port, host);
}).then(() => {
	let opts = process.argv.slice(2);
	opts = opts.concat(['run']);
	if (opts.indexOf('--config') === -1) {
		opts = opts.concat(['--config', 'test/e2e/codecept.json']);
	}

	const spawn = require('cross-spawn');
	const runner = spawn('./node_modules/.bin/codeceptjs', opts, { stdio: 'inherit' });

	const iiifApi = require('../iiif-api/server.js');

	runner.on('exit', (code) => {
		server.close();
		iiifApi.close();
		process.exit(code);
	});

	runner.on('error', (err) => {
		server.close();
		iiifApi.close();
		throw err;
	});
});
