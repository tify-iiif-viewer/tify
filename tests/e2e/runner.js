const opts = process.argv.slice(2);
let args = ['test:e2e'];

opts.forEach((opt) => {
	if (opt === '--headless') {
		args = [...args, '--headless'];
	}
});

const spawn = require('cross-spawn');
const iiifApi = require('../iiif-api/server');

const runner = spawn('./node_modules/.bin/vue-cli-service', args, { stdio: 'inherit' });

runner.on('exit', (code) => {
	iiifApi.close();
	process.exit(code);
});

runner.on('error', (err) => {
	iiifApi.close();
	throw err;
});
