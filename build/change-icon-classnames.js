const replace = require('replace-in-file');

// Replace class names in icon files
replace.sync({
	files: `${__dirname}/../node_modules/vue-material-design-icons/*.vue`,
	from: [/class="material-design-icon .*?"/g, /\s*class="material-design-icon__svg"/],
	to: ['class="tify-icon"', ''],
});
