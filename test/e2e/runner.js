process.env.NODE_ENV = 'dev';
var server = require('../../build/dev-server.js');

server.ready.then(() => {
	var spawn = require('cross-spawn');
	var runner = spawn('./node_modules/.bin/codeceptjs', ['run'], { stdio: 'inherit' });

	runner.on('exit', function (code) {
		server.close();
		process.exit(code);
	});

	runner.on('error', function (err) {
		server.close();
		throw err;
	});
});
