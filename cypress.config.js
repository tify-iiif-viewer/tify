import { defineConfig } from 'cypress';

import htmlvalidate from 'cypress-html-validate/plugin';

// eslint-disable-next-line import/extensions
import server from './tests/iiif-api/server.js';

const iiifApiPort = 8082;

server.start(iiifApiPort);

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:4173',
		specPattern: 'tests/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',

		viewportWidth: 1280,
		viewportHeight: 720,

		fixturesFolder: 'tests/e2e/fixtures',
		screenshotsFolder: 'tests/e2e/screenshots',
		videosFolder: 'tests/e2e/videos',
		downloadsFolder: 'tests/e2e/downloads',
		supportFile: 'tests/e2e/support/e2e.js',

		setupNodeEvents(on) {
			htmlvalidate.install(on);
		},
	},
	env: {
		iiifApiUrl: `http://0.0.0.0:${iiifApiPort}`,
	},
});
