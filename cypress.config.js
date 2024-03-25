import { defineConfig } from 'cypress';

// eslint-disable-next-line import/extensions
import server from './tests/iiif-api/server.js';

const iiifApiPort = 8082;

server.start(iiifApiPort);

export default defineConfig({
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
		iiifApiUrl: `http://0.0.0.0:${iiifApiPort}`,
	},
});
