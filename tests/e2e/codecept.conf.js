const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// HEADLESS=true npx codecept run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
	tests: './specs/*.spec.js',
	timeout: 10000,
	output: './output',
	helpers: {
		Nightmare: {
			url: 'http://localhost:8080',
			show: true,
			waitForAction: 100,
		},
		NightmareHelper: {
			require: './NightmareHelper.js',
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
	},
};
