const { defineConfig } = require('cypress');

process.env.iiifApiPort = 8082;
require('./tests/iiif-api/server');

module.exports = defineConfig({
	e2e: {
		baseUrl: 'http://localhost:4173',
		specPattern: 'tests/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',

		viewportWidth: 1600,
		viewportHeight: 900,

		fixturesFolder: 'tests/e2e/fixtures',
		screenshotsFolder: 'tests/e2e/screenshots',
		videosFolder: 'tests/e2e/videos',
		downloadsFolder: 'tests/e2e/downloads',
		supportFile: false,
	},
	env: {
		iiifApiUrl: `http://0.0.0.0:${process.env.iiifApiPort}`,
	},
});
