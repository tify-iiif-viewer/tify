import fs from 'fs';
import http from 'http';
import url from 'url';

import { createCanvas } from 'canvas';

const dataDir = url.fileURLToPath(new URL('data', import.meta.url));
const server = http.createServer();

server.on('request', (req, res) => {
	const { path } = url.parse(req.url);
	const segments = path.split('/') || [];

	function outputImage() {
		const ext = segments?.at(-1)?.split('.')[1];

		let contentType = 'image/';
		if (!ext || ext === 'jpg') {
			contentType += 'jpeg';
		} else if (ext === 'svg') {
			contentType += 'svg+xml';
		} else {
			contentType += ext;
		}

		res.writeHead(200, { 'Content-type': contentType });

		if (ext === 'svg') {
			res.write(`
				<svg xmlns="http://www.w3.org/2000/svg" width="188" height="80">
					<text dominant-baseline="central" fill="#06b" font-size="100" y="50%">
						SVG
					</text>
				</svg>
			`);

			res.end();

			return;
		}

		let [width, height] = (segments.at(-3) || '').split(',').map((value) => parseInt(value, 10));
		if (!width && !height) {
			height = 1024;
			width = 1024;
		} else {
			width = width || 128;
			height = height || 128;
		}

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');

		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, '#fff');
		gradient.addColorStop(1, '#eee');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		const fontSize = width / 40;
		segments.slice(1).forEach((text, index) => {
			ctx.fillStyle = '#000';
			ctx.font = `${fontSize}px monospace`;
			ctx.fillText(`/${text}`, fontSize, fontSize * 2 + fontSize * 1.5 * index);
		});

		const buffer = canvas.toBuffer(contentType);
		res.write(buffer);

		res.end();
	}

	function outputJson(fileName) {
		const filePath = fs.realpathSync(`${dataDir}/${fileName}`);

		if (!filePath.startsWith(dataDir)) {
			res.statusCode = 403;
			res.end();
			return;
		}

		fs.readFile(filePath, 'utf8', (error, data) => {
			if (error) {
				res.writeHead(404);
			} else {
				res.writeHead(200, { 'Content-type': 'application/json' });

				const parsedData = data
					// Rewrite all remote URLs to local ones, except IIIF API profiles
					.replace(
						/(?!http:\/\/iiif.io\/api\/(image|\w+\/\d+\/context\.json))https?:\/\/[a-z0-9-.:]*/gi,
						`http://127.0.0.1:${server.port}`,
					)
					// Replace ID placeholders
					.replace(
						/\{\{ *id.path *\}\}/g,
						`http://127.0.0.1:${server.port}${segments.slice(0, -1).join('/')}`,
					);

				res.write(parsedData);
			}

			res.end();
		});
	}

	let action;
	let file;
	if (segments[1] === 'iiif-cookbook') {
		action = 'cookbook';
		file = segments.slice(2).join('/');
	} else if (segments[1] === 'presentation' && segments[2] === 'v2') {
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
	} else if (segments.at(-1).endsWith('.jpg') || segments.at(-1).endsWith('.png')) {
		action = 'image';
	} else {
		action = segments.at(-1) === 'info.json' ? 'info' : segments[1];

		if (segments[2] && action !== 'annotations') {
			file = segments[2] + (segments[2].endsWith('.json') ? '' : '.json');
		}
	}

	req.on('data', () => { });

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

		switch (action) {
			case 'cookbook':
				outputJson(`iiif-cookbook/recipe/${file}`);
				break;
			case 'manifest':
				outputJson(`manifests/${file}`);
				break;
			case 'annotation-lists':
				outputJson(`annotation-lists/${file}`);
				break;
			case 'annotations':
				outputJson(`annotations/${file || 'default.json'}`);
				break;
			case 'info':
				outputJson('infos/default.json');
				break;
			case 'image':
			case 'images':
			case 'logos':
				outputImage();
				break;
			default:
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
