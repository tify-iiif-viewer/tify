process.env.NODE_ENV = 'test';
process.env.HEADLESS = true;

const Service = require('@vue/cli-service');

const service = new Service(process.cwd());
service.init('production');

service
	.run('serve')
	.then(({ server }) => {
		let opts = process.argv.slice(2);
		opts = opts.concat(['run']);
		if (opts.indexOf('--config') === -1) {
			opts = opts.concat(['--config', 'tests/e2e/codecept.conf.js']);
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
