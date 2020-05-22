const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);

exports.config = {
	tests: './specs/*.spec.js',
	timeout: 10000,
	output: './output',
	helpers: {
		WebDriverIO: {
			url: 'http://localhost:8888',
			browser: 'chrome',
			windowSize: '1600x900',
		},
	},
	include: {
		I: './steps_file.js',
	},
	bootstrap: null,
	mocha: {},
	name: 'tify',
	plugins: {
		retryFailedStep: {
			enabled: true,
		},
		screenshotOnFail: {
			enabled: true,
		},
		wdio: {
			enabled: true,
			services: ['selenium-standalone'],
		},
	},
	multiple: {
		basic: {
			browsers: ['firefox', 'chrome'],
		},
		smoke: {
			grep: '@smoke',
			browsers: [
				{ browser: 'firefox' },
				{ browser: 'chrome' },
			],
		},
	},
};
