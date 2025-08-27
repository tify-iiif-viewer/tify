import fs from 'fs';
import http from 'http';
import url from 'url';

import { createCanvas } from 'canvas';

const dataDir = url.fileURLToPath(new URL('data', import.meta.url));
const server = http.createServer();

server.on('request', (req, res) => {
	const { path } = url.parse(req.url);
	const segments = path.split('/').slice(1) || [];

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
		segments.forEach((text, index) => {
			ctx.fillStyle = '#000';
			ctx.font = `${fontSize}px monospace`;
			ctx.fillText(`/${text}`, fontSize, fontSize * 2 + fontSize * 1.5 * index);
		});

		const buffer = canvas.toBuffer(contentType);
		res.write(buffer);
		res.end();
	}

	function outputJson(fileName) {
		let filePath;
		try {
			filePath = fs.realpathSync(`${dataDir}/${fileName}`);
		} catch (error) {
			console.error(`Unknown file: ${error.path}`);
			res.writeHead(404);
			res.end();
			return;
		}

		if (!filePath.startsWith(dataDir) || !fs.lstatSync(filePath).isFile()) {
			console.error(`Cannot access file: ${filePath}`);
			res.writeHead(403);
			res.end();
			return;
		}

		const data = fs.readFileSync(filePath, 'utf8')
			?.replace(
				// Rewrite all remote URLs to local ones, except IIIF API profiles
				/(?!http:\/\/iiif.io\/api\/(image|\w+\/\d+\/context\.json))https?:\/\/[a-z0-9-.:]*/gi,
				`http://127.0.0.1:${server.port}`,
			)
			.replace(
				// Replace ID placeholders in IIIF Cookbook manifests
				/\{\{ *id.path *\}\}/g,
				`http://127.0.0.1:${server.port}/${segments.slice(0, -1).join('/')}`,
			);

		res.writeHead(200, { 'Content-type': 'application/json' });
		res.write(data);
		res.end();
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

		if (segments[0] === 'iiif-cookbook') {
			outputJson(`iiif-cookbook/recipe/${segments.slice(1).join('/')}`);
		} else if (segments[0] === 'presentation' && segments[1] === 'v2') {
			// Rewrite collection child manifest URLs for local testing
			outputJson(`manifests/wellcome-${segments[2]}.json`);
		} else if (segments[3] === 'list') {
			// Rewrite annotation lists URLs for local testing
			outputJson(`annotation-lists/${(segments[4] || 'default').replace(/:/g, '-')}.json`);
		} else if (segments[0] === 'annotations') {
			// Rewrite annotation URLs for local testing
			outputJson('annotations/default.json');
		} else if (segments[0] === 'fulltext') {
			// Rewrite XML annotation URLs for local testing
			outputJson(`annotations/gdz-${segments[1]}-${segments[2]}`);
		} else if (['jpg', 'png', 'svg'].includes(segments.at(-1).split('.').at(-1))) {
			outputImage();
		} else if (['audio', 'video'].includes(segments[0])) {
			const filePath = `${dataDir}/fixtures/sample.mp4`;
			const stats = fs.statSync(filePath);

			res.writeHead(200, {
				'Content-Type': `${segments[0]}/mpeg`,
				'Content-Length': stats.size,
			});

			fs.createReadStream(filePath).pipe(res);
		} else if (segments.at(-1) === 'info.json') {
			outputJson('infos/default.json');
		} else {
			outputJson(path);
		}
	});
});

export default {
	start(port = 8081) {
		server.listen(port);
		server.port = port;

		console.log(`  🤖 Mock IIIF API listening at http://localhost:${port}\n`);
	},
	stop() {
		server.close();
	},
};
