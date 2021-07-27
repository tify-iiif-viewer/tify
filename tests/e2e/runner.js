process.env.NODE_ENV = 'test';
process.env.HEADLESS = true;

const Service = require('@vue/cli-service');

const service = new Service(process.cwd());
service.init('production');
service
	.run('serve')
	.then(({ server }) => {
		const opts = process.argv.slice(2);
		let args = ['test:e2e'];

		opts.forEach((opt) => {
			if (opt === '--headless') {
				args = [...args, '--headless'];
			}
		});

		const spawn = require('cross-spawn');
		const runner = spawn('./node_modules/.bin/vue-cli-service', args, { stdio: 'inherit' });

		const iiifApi = require('../iiif-api/server');

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
