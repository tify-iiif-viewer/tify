process.env.NODE_ENV = 'dev';
const server = require('../../build/dev-server.js');
const iiifApi = require('../iiif-api/server.js');

server.ready.then(() => {
	const spawn = require('cross-spawn');
	const runner = spawn('./node_modules/.bin/codeceptjs', ['run'], { stdio: 'inherit' });

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
