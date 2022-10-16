const fs = require('fs');

if (!fs.existsSync(`${__dirname}/../node_modules/@mdi/js`)) {
	process.exit();
}

const mdi = require('@mdi/js');

const iconsDir = `${__dirname}/../src/components/icons`;

fs.mkdirSync(iconsDir, { recursive: true });

Object.keys(mdi).forEach((key) => {
	const componentHtml = `

<template>
	<svg class="tify-icon" viewBox="0 0 24 24">
		<path d="${mdi[key]}"/>
	</svg>
</template>

	`;

	fs.writeFileSync(`${iconsDir}/Icon${key.substring(3)}.vue`, `${componentHtml.trim()}\n`);
});
