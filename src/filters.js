import Vue from 'vue';
import striptags from 'striptags';
import app from './main';

Vue.filter('filterHtml', (html) => {
	// See http://iiif.io/api/presentation/2.1/#html-markup-in-property-values
	const allowedTags = ['a', 'b', 'br', 'i', 'img', 'p', 'span'];
	const allowedAttributes = { a: ['href'], img: ['alt', 'src'] };

	// TODO: striptags removes '<' and '>' inside attribute values
	let filteredHtml = striptags(html, allowedTags);

	// Iterate over all opening (including self-closing) HTML tags
	const htmlTagsRegex = /<(\w+)((\s+[\w]+(\s*=\s*(?:".*?"|'.*?'|.*?|[\^'">\s]+))?)+\s*|\s*)>/g;
	filteredHtml = filteredHtml.replace(htmlTagsRegex, (match, tag, attributes) => {
		if (!attributes) return `<${tag}>`;

		// Iterate over all attibutes and keep only allowed ones
		const attributesRegex = /(?:([^\s]+)="(.*?)"|'(.*?)')|([^\s]+)/g;
		const keptAttributes = [];
		attributes.replace(attributesRegex, (tuple, key) => {
			if (tuple !== key && allowedAttributes[tag] && allowedAttributes[tag].indexOf(key) > -1) {
				keptAttributes.push(tuple);
			}
		});

		return (keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`);
	});

	return filteredHtml;
});

// Translate strings, use default (i.e. English) if not translated
// Translations are located in @/translations/<lang>.js
Vue.filter('trans', (string) => {
	if (app.messages[string]) return app.messages[string];

	if (process.env.NODE_ENV === 'development' && app.options.language !== 'en') {
		console.warn(`Missing translation for ${string}`); // eslint-disable-line no-console
	}
	return string;
});
