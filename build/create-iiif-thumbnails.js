import fs from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import sharp from 'sharp';
import { upgrade } from '@iiif/parser/upgrader';

// eslint-disable-next-line import/extensions
import { filenamifyUrl } from '../src/demo/modules/filenamify.js';

// eslint-disable-next-line import/extensions
import sampleManifests from '../src/demo/manifests.js';

const thumbnailsDir = path.resolve(path.dirname(import.meta.url.replace('file://', '')), '../public/thumbnails');
const thumbnailWidth = 240;
const thumbnailHeight = 240;
const thumbnailOverflow = 8;

if (!fs.existsSync(thumbnailsDir)) {
	fs.mkdirSync(thumbnailsDir, { recursive: true });
}

async function saveThumbnail(manifestUrl, parentUrl = '') {
	const thumbnailFilename = `${thumbnailsDir}/${filenamifyUrl(parentUrl || manifestUrl)}.avif`;

	if (fs.existsSync(thumbnailFilename)) {
		return {
			alreadyExists: true,
			thumbnailFilename,
		};
	}

	// Fetch IIIF manifest
	let manifestRes;
	try {
		manifestRes = await fetch(manifestUrl);
		if (!manifestRes.ok) {
			return { error: `Failed to fetch manifest: ${manifestRes.statusText}` };
		}
	} catch (error) {
		return { error: 'Failed to fetch manifest' };
	}

	const originalManifest = await manifestRes.json();

	// Upgrade to IIIF 3 manifest using @iiif/parser/upgrader
	const manifest = upgrade(originalManifest);

	if (manifest.type === 'Collection' || manifest['@type'] === 'sc:Collection') {
		const manifests = manifest.items || manifest.manifests || [];

		for (let i = 0; i < manifests.length; i += 1) {
			// eslint-disable-next-line no-await-in-loop
			const result = await saveThumbnail(manifests[i].id || manifests[i]['@id'], parentUrl || manifestUrl);
			if (!result.error) {
				return result;
			}
		}

		return { error: `Failed loading thumbnail for any manifest in collection of ${manifests.length}` };
	}

	let imageUrl = null;

	if (manifest.thumbnail && manifest.thumbnail.length) {
		const thumbnail = manifest.thumbnail[0];
		if (thumbnail.width >= thumbnailWidth + thumbnailOverflow * 2
			&& thumbnail.height >= thumbnailHeight + thumbnailOverflow * 2
		) {
			imageUrl = thumbnail.id || thumbnail['@id'];
		}
	}

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
			const service = [].concat(resource.service)[0];
			const quality = ['ImageService2', 'ImageService3'].includes(service.type || service['@type'])
				? 'default'
				: 'native';
			const id = service.id || service['@id'];
			// NOTE: Using "full" instead of "square" because the latter is not supported by all APIs
			imageUrl = `${id}${id.at(-1) === '/' ? '' : '/'}full/${thumbnailWidth + thumbnailOverflow * 2},/0/${quality}.jpg`;
		} else if (resource.format.startsWith('image/')) {
			// Filter out non-image resources like audio
			imageUrl = resource?.id;
		}
	}

	if (!imageUrl) {
		return { error: 'No image URL found on the annotation body' };
	}

	// Fetch and save the image
	const imageRes = await fetch(imageUrl);
	if (!imageRes.ok) {
		return { error: `Failed to fetch image from ${imageUrl} (${imageRes.statusText})` };
	}

	const imageBuffer = await imageRes.arrayBuffer();
	await sharp(Buffer.from(imageBuffer))
		.resize(thumbnailWidth + thumbnailOverflow * 2, thumbnailHeight + thumbnailOverflow * 2)
		.extract({
			width: thumbnailWidth,
			height: thumbnailHeight,
			left: thumbnailOverflow,
			top: thumbnailOverflow,
		})
		.toFile(thumbnailFilename);

	return {
		thumbnailFilename,
	};
}

console.log();

if (!sampleManifests?.length) {
	console.warn(chalk.redBright('No manifests found\n'));
	process.exit();
}

sampleManifests.forEach((manifest) => {
	saveThumbnail(manifest.url).then((result) => {
		console.log(`Manifest: ${chalk.bold(manifest.url)}`);
		if (result.error) {
			console.warn(chalk.redBright(`❌ Failed: ${result.error}\n`));
		} else if (result.alreadyExists) {
			console.log(`🤷 Thumbnail already exists: ${chalk.dim('file://')}${result.thumbnailFilename}\n`);
		} else {
			console.log(`✅ Thumbnail saved: ${chalk.dim('file://')}${result.thumbnailFilename}\n`);
		}
	});
});
