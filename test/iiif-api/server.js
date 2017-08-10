const config = require('./config');
const fs = require('fs');
const http = require('http');
const url = require('url');

const server = http.createServer().listen(config.port, config.host);
console.log(`> Mock REST API running on port ${config.port}`);

server.on('request', (req, res) => {
	const path = url.parse(req.url).path;
	const segments = path.split('/');
	const action = segments[1];
	const file = segments[2];

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
				res.write(data);
			}
			res.end();
		});
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
			outputJson(`${__dirname}/${config.dataDir}/manifests/${file}`);
		} else if (action === 'annotation-list') {
			outputJson(`${__dirname}/${config.dataDir}/annotation-lists/default.json`);
		} else if (action === 'info') {
			outputJson(`${__dirname}/${config.dataDir}/infos/default.json`);
		} else if (action === 'image') {
			outputJpeg(`${__dirname}/${config.dataDir}/images/default.jpg`);
		} else {
			res.writeHead(400);
			res.end();
		}
	});
});

module.exports = {
	close: () => { server.close(); },
};
