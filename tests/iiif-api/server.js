import fs from 'fs';
import http from 'http';
import url from 'url';

const dataDir = url.fileURLToPath(new URL('data', import.meta.url));
const server = http.createServer();

server.on('request', (req, res) => {
	function outputJpeg(fileName) {
		fs.readFile(fileName, (error, data) => {
			if (error) {
				res.writeHead(404);
			} else {
				res.writeHead(200, { 'Content-type': 'image/jpeg' });
				res.write(data);
			}

			res.end();
		});
	}

	function outputJson(fileName) {
		fs.readFile(fileName, 'utf8', (error, data) => {
			if (error) {
				res.writeHead(404);
			} else {
				res.writeHead(200, { 'Content-type': 'application/json' });

				// Rewrite all remote URLs to local ones, except IIIF API profiles
				const dataWithLocalUrls = data.replace(
					/(?!http:\/\/iiif.io\/api\/)https?:\/\/[a-z0-9-.:]*/gi,
					`http://127.0.0.1:${server.port}`,
				);

				res.write(dataWithLocalUrls);
			}

			res.end();
		});
	}

	const { path } = url.parse(req.url);
	const segments = path.split('/');
	let action;
	let file;
	if (segments[1] === 'presentation' && segments[2] === 'v2') {
		// Rewrite collection child manifest URLs for local testing
		action = 'manifest';
		file = `wellcome-${segments[3]}.json`;
	} else if (segments[4] === 'list') {
		// Rewrite annotation lists URLs for local testing
		action = 'annotation-lists';
		file = `${(segments[5] || 'default').replace(/:/g, '-')}.json`;
	} else if (segments[1] === 'fulltext') {
		// Rewrite fulltext URL for local testing
		action = 'annotations';
		file = `gdz-${segments[2]}-${segments[3]}`;
	} else if (path.endsWith('.jpg')) {
		action = 'image';
	} else {
		action = segments.at(-1) === 'info.json' ? 'info' : segments[1];

		if (segments[2] && action !== 'annotations') {
			file = segments[2] + (segments[2].endsWith('.json') ? '' : '.json');
		}
	}

	req.on('data', () => {});

	req.on('end', () => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Request-Method', '*');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
		res.setHeader('Access-Control-Allow-Headers', '*');

		if (req.method === 'OPTIONS') {
			res.writeHead(200);
			res.end();
			return;
		}

		if (action === 'manifest') {
			outputJson(`${dataDir}/manifests/${file}`);
		} else if (action === 'annotation-lists') {
			outputJson(`${dataDir}/annotation-lists/${file}`);
		} else if (action === 'annotations') {
			outputJson(`${dataDir}/annotations/${file || 'default.json'}`);
		} else if (action === 'info') {
			outputJson(`${dataDir}/infos/default.json`);
		} else if (['image', 'images', 'logos'].includes(action)) {
			outputJpeg(`${dataDir}/images/default.jpg`);
		} else {
			res.writeHead(400);
			res.end();
		}
	});
});

export default {
	start(port = 8081) {
		server.listen(port);
		server.port = port;

		// eslint-disable-next-line no-console
		console.log(`  🤖 Mock IIIF API listening at http://localhost:${port}\n`);
	},
	stop() {
		server.close();
	},
};
