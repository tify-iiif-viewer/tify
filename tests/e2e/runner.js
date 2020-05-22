process.env.NODE_ENV = 'test';
process.env.HEADLESS = true;

const Service = require('@vue/cli-service');

const service = new Service(process.cwd());
service.init('production');
service
	.run('serve')
	.then(({ server }) => {
		const opts = process.argv.slice(2);
		const config = ['--config', 'tests/e2e/codecept.conf.js'];
		let runOpts = [];

		if (opts.length === 0) {
			runOpts = ['run-multiple', ...config, 'basic:chrome', 'smoke:firefox'];
		} else {
			runOpts = ['run', ...config];
			opts.forEach((opt) => {
				if (opt === 'firefox') {
					runOpts = [...runOpts, '--override', '{ "helpers": {"WebDriverIO": {"browser": "firefox"}}}'];
				}
			});
		}

		const spawn = require('cross-spawn');
		const runner = spawn('./node_modules/.bin/codeceptjs', runOpts, { stdio: 'inherit' });

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
