import { createCanvas } from 'canvas';
import fs from 'fs';
import http from 'http';
import url from 'url';

const dataDir = url.fileURLToPath(new URL('data', import.meta.url));
const server = http.createServer();

server.on('request', (req, res) => {
	const { path } = url.parse(req.url);
	const segments = path.split('/');

	function outputJpeg() {
		let [width, height] = segments.at(-3).split(',').map(value => parseInt(value, 10));
		width = width || 128;
		height = height || 128;

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');

		const gradient = ctx.createLinearGradient(0, 0, width, height);
		gradient.addColorStop(0, '#ddd');
		gradient.addColorStop(1, '#ccc');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		const fontSize = width / 40;
		segments.slice(1).forEach((text, index) => {
			ctx.fillStyle = '#000';
			ctx.font = `${fontSize}px monospace`;
			ctx.fillText(`/${text}`, fontSize, fontSize * 2 + fontSize * 1.5 * index);
		});

		const buffer = canvas.toBuffer('image/jpeg');

		res.writeHead(200, { 'Content-type': 'image/jpeg' });
		res.write(buffer);

		res.end();
	}

	function outputJson(fileName) {
		fs.readFile(fileName, 'utf8', (error, data) => {
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
	} else if (path.endsWith('.jpg') || path.endsWith('.png')) {
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
				outputJson(`${dataDir}/iiif-cookbook/recipe/${file}`);
				break;
			case 'manifest':
				outputJson(`${dataDir}/manifests/${file}`);
				break;
			case 'annotation-lists':
				outputJson(`${dataDir}/annotation-lists/${file}`);
				break;
			case 'annotations':
				outputJson(`${dataDir}/annotations/${file || 'default.json'}`);
				break;
			case 'info':
				outputJson(`${dataDir}/infos/default.json`);
				break;
			case 'image':
			case 'images':
			case 'logos':
				outputJpeg();
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
