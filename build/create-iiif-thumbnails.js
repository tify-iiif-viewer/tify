import chalk from 'chalk';
import filenamifyUrl from 'filenamify-url';
import sharp from 'sharp';
import { readdirSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { upgrade } from '@iiif/parser/upgrader';

// eslint-disable-next-line import/extensions
import sampleManifests from '../src/demo-app/sampleManifests.js';

const thumbnailsDir = resolve(dirname(import.meta.url.replace('file://', '')), '../public/thumbnails');
const thumbnailWidth = 240;
const thumbnailHeight = 240;

async function saveThumbnail(manifestUrl, parentUrl = '') {
	// Fetch the IIIF manifest
	const manifestRes = await fetch(manifestUrl);
	if (!manifestRes.ok) {
		return { error: `Failed to fetch manifest ${manifestRes.statusText}` };
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

	// Try manifest-level thumbnail first
	let imageUrl = null;
	// if (manifest.thumbnail && manifest.thumbnail.length > 0) {
	// 	imageUrl = manifest.thumbnail[0].id || manifest.thumbnail[0]['@id'];
	// }

	// Fallback: if no thumbnail, use the start canvas or first canvas
	if (!imageUrl) {
		const startCanvasId = manifest.start?.id || manifest.items?.[0]?.id;

		if (!startCanvasId) {
			return { error: 'No thumbnail found, and no canvases in this manifest' };
		}

		const startCanvas = manifest.items?.find((c) => c.id === startCanvasId);
		if (!startCanvas?.items?.length) {
			return { error: 'Canvas found but no annotation pages present' };
		}

		const annotationPage = startCanvas.items[0];
		if (!annotationPage?.items?.length) {
			return { error: 'No annotations found on this canvas annotation page' };
		}

		const annotation = annotationPage.items[0];
		const resource = annotation?.body || annotation?.body;

		if (resource?.service) {
			const service = resource.service instanceof Array ? resource.service[0] : resource.service;
			const quality = ['ImageService2', 'ImageService3'].includes(service.type || service['@type'])
				? 'default'
				: 'native';
			const id = service.id || service['@id'];
			// NOTE: Using "full" instead of "square" because the latter is not supported by all APIs
			imageUrl = `${id}${id.at(-1) === '/' ? '' : '/'}full/${thumbnailWidth},/0/${quality}.jpg`;
		} else {
			imageUrl = resource?.id;
		}

		if (!imageUrl) {
			return { error: 'No image URL found on the annotation body' };
		}
	}

	// Fetch and save the image
	const imageRes = await fetch(imageUrl);
	if (!imageRes.ok) {
		return { error: `Failed to fetch image from ${imageUrl} (${imageRes.statusText})` };
	}

	const imageBuffer = await imageRes.arrayBuffer();
	const thumbnailFilename = `${thumbnailsDir}/${filenamifyUrl(parentUrl || manifestUrl)}.avif`;
	await sharp(Buffer.from(imageBuffer))
		.resize(thumbnailWidth, thumbnailHeight)
		.toFile(thumbnailFilename);

	return { thumbnailFilename };
}

console.log();

if (!sampleManifests?.length) {
	console.warn(chalk.redBright('No manifests found\n'));
	process.exit();
}

const files = readdirSync(thumbnailsDir);
files.forEach((file) => unlinkSync(`${thumbnailsDir}/${file}`));

sampleManifests.forEach((manifest) => {
	saveThumbnail(manifest.url).then((result) => {
		console.log(`Manifest: ${chalk.bold(manifest.url)}`);
		if (result.error) {
			console.warn(chalk.redBright(`❌ Failed: ${result.error}\n`));
		} else {
			console.log(`✅ Thumbnail saved as ${chalk.dim('file://')}${result.thumbnailFilename}\n`);
		}
	});
});
