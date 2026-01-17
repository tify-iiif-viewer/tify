import fs from 'node:fs';
import url from 'node:url';

const rootDir = url.fileURLToPath(new URL('..', import.meta.url));

if (!fs.existsSync(`${rootDir}/node_modules/@mdi/js`)) {
	process.exit();
}

const mdi = await import('@mdi/js');

const iconsDir = `${rootDir}/generated/icons`;

fs.mkdirSync(iconsDir, { recursive: true });

Object.keys(mdi).forEach((key) => {
	const dashedKey = key
		.replace(/^mdi/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();

	const componentHtml = `

<template>
	<svg class="tify-icon -${dashedKey}" aria-hidden="true" viewBox="0 0 24 24">
		<path d="${mdi[key]}"/>
	</svg>
</template>

	`;

	fs.writeFileSync(`${iconsDir}/Icon${key.substring(3)}.vue`, `${componentHtml.trim()}\n`);
});
