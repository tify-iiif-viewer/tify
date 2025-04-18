import sharp from 'sharp';
import { readdirSync, unlinkSync } from 'node:fs';
import { upgrade } from '@iiif/parser/upgrader';

import sampleManifests from '../src/sample-app/sampleManifests.js';

const dir = 'public/thumbnails';
const width = 240;
const height = 240;

async function saveThumbnail(manifestUrl, parentUrl = '') {
	const logs = [];

	// Fetch the IIIF manifest
	const manifestRes = await fetch(manifestUrl);
	if (!manifestRes.ok) {
		logs.push(`Failed to fetch manifest ${manifestRes.statusText}`);
	}
	const originalManifest = await manifestRes.json();

	// Upgrade to a v3 manifest using @iiif/parser/upgrader
	const manifest = upgrade(originalManifest);

	if (manifest.type === 'Collection') {
		return saveThumbnail(manifest.items[0].id, parentUrl || manifestUrl);
	}

	if (manifest['@type'] === 'sc:Collection') {
		return saveThumbnail(manifest.manifests[0]['@id'], parentUrl || manifestUrl);
	}

	logs.push(parentUrl || manifestUrl);

	// Try manifest-level thumbnail first
	let imageUrl = null;
	// if (manifest.thumbnail && manifest.thumbnail.length > 0) {
	// 	imageUrl = manifest.thumbnail[0].id || manifest.thumbnail[0]['@id'];
	// }

	// Fallback: if no thumbnail, use the start canvas or first canvas
	if (!imageUrl) {
		const startCanvasId = manifest.start?.id || manifest.items?.[0]?.id;

		if (!startCanvasId) {
			logs.push('No thumbnail found, and no canvases in this manifest');
			return logs;
		}

		const startCanvas = manifest.items?.find((c) => c.id === startCanvasId);
		if (!startCanvas?.items?.length) {
			logs.push('Canvas found but no annotation pages present');
			return logs;
		}

		const annotationPage = startCanvas.items[0];
		if (!annotationPage?.items?.length) {
			logs.push('No annotations found on this canvas annotation page');
			return logs;
		}

		const annotation = annotationPage.items[0];
		const resource = annotation?.body || annotation?.body;

		if (resource?.service) {
			const service = resource.service instanceof Array ? resource.service[0] : resource.service;
			const quality = ['ImageService2', 'ImageService3'].includes(service.type || service['@type'])
				? 'default'
				: 'native';
			const id = service.id || service['@id'];
			imageUrl = `${id}${id.at(-1) === '/' ? '' : '/'}full/${width},/0/${quality}.jpg`;
		} else {
			imageUrl = resource?.id;
		}

		if (!imageUrl) {
			logs.push('No image URL found on the annotation body');
			return logs;
		}
	}

	// Fetch and save the image
	const imageRes = await fetch(imageUrl);
	if (!imageRes.ok) {
		logs.push(`Failed to fetch image from ${imageUrl} (${imageRes.statusText})`);
		return logs;
	}

	const imageBuffer = await imageRes.arrayBuffer();
	const outputFilename = `${dir}/${(parentUrl || manifestUrl).replace(/[^\w]/g, '')}.avif`;
	await sharp(Buffer.from(imageBuffer))
		.resize(width, height)
		.toFile(outputFilename);

	logs.push(`Thumbnail saved as ${outputFilename}`);

	return logs;
}

const files = readdirSync(dir);
files.forEach((file) => unlinkSync(`${dir}/${file}`));

sampleManifests.forEach(async (manifest) => {
	const logs = await saveThumbnail(manifest.url);
	console.log(`${logs.join('\n  ')}\n`);
});
