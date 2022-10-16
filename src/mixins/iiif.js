import striptags from 'striptags';

export default {
	methods: {
		convertValueToArray(value) {
			// http://iiif.io/api/presentation/2.1/#language-of-property-values

			if (!(value instanceof Array)) {
				if (typeof value === 'object') {
					if (value['@value']) {
						return [this.filterHtml(value['@value'])];
					}

					if (value['@id']) {
						const id = this.filterHtml(value['@id']);
						return [{ '@id': id, label: (value.label ? this.filterHtml(value.label) : id) }];
					}

					return ['(Invalid value)'];
				}

				return [this.filterHtml(value)];
			}

			const displayedValues = [];
			const translation = {};
			value.forEach((item) => {
				if (typeof item === 'string' || (item['@id'] && item.label)) {
					displayedValues.push(item);
				} else if (item && typeof item !== 'object') {
					displayedValues.push(this.filterHtml(item));
				} else if (item['@language'] && item['@value']) {
					if (!translation.fallback) {
						translation.fallback = item['@value'];
					}

					if (item['@language'].indexOf('en') === 0) {
						// Language is en or en-US or en-GB
						translation.en = item['@value'];
					} else if (item['@language'] === this.options.language) {
						translation.preferred = item['@value'];
					}
				}
			});

			const translatedValue = (
				translation.preferred
				|| translation.en
				|| translation.fallback
				|| null
			);
			if (translatedValue) {
				displayedValues.push(this.filterHtml(translatedValue));
			}

			return displayedValues;
		},
		filterHtml(html) {
			// See http://iiif.io/api/presentation/2.1/#html-markup-in-property-values
			const allowedTags = ['a', 'b', 'br', 'i', 'img', 'p', 'span'];
			const allowedAttributes = { a: ['href'], img: ['alt', 'src'] };

			// TODO: striptags removes '<' and '>' inside attribute values
			let filteredHtml = striptags(html, allowedTags);

			// Iterate over all opening (including self-closing) HTML tags
			const htmlTagsRegex = /<(\w+)((\s+.+?(\s*=\s*(?:".*?"|'.*?'|.*?|[\^'">\s]+))?)+\s*|\s*)>/g;
			filteredHtml = filteredHtml.replace(htmlTagsRegex, (match, tag, attributes) => {
				if (!attributes) {
					return `<${tag}>`;
				}

				// Iterate over all attributes and keep only allowed ones
				const attributesRegex = /(?:([^\s]+)=(?:"(.*?)"|'(.*?)'))|([^\s]+)/g;
				const keptAttributes = [];
				attributes.replace(attributesRegex, (tuple, key) => {
					if (tuple !== key && allowedAttributes[tag] && allowedAttributes[tag].indexOf(key) > -1) {
						keptAttributes.push(tuple);
					}
				});

				return (keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`);
			});

			return filteredHtml;
		},
		isManifest(manifest) {
			return manifest && Array.isArray(manifest.sequences);
		},
	},
};
