const fs = require('fs');
const http = require('http');
const url = require('url');
const config = require('./config.json');

const server = http.createServer().listen(config.port, config.host);
console.log(`  Mock IIIF API listening at http://localhost:${config.port}`);

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
					/https?:\/\/(?!iiif.io\/api\/)[a-z0-9-.:]*/gi,
					`http://localhost:${config.port}`,
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
		file = `wellcome-${segments[3]}`;
	} else if (path.endsWith('.jpg')) {
		action = 'image';
	} else {
		action = segments.slice(-1)[0] === 'info.json' ? 'info' : segments[1];

		if (segments[2]) {
			file = segments[2].replace(/\.json$/, '');
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
			outputJson(`${__dirname}/${config.dataDir}/manifests/${file}.json`);
		} else if (action === 'annotations') {
			outputJson(`${__dirname}/${config.dataDir}/annotations/default.json`);
		} else if (action === 'info') {
			outputJson(`${__dirname}/${config.dataDir}/infos/default.json`);
		} else if (['image', 'images', 'logos'].includes(action)) {
			outputJpeg(`${__dirname}/${config.dataDir}/images/default.jpg`);
		} else {
			res.writeHead(400);
			res.end();
		}
	});
});

module.exports = {
	close: () => {
		server.close();
	},
};
