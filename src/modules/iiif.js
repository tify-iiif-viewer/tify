import { nextTick } from 'vue';
import striptags from 'striptags';

import { error, setError } from './error';
import { fetchJson, initOptions } from './http';
import {
	collection,
	getStartPage,
	options,
	setCollection,
	setManifest,
	updateOptions,
} from './store';
import { isMobile } from './ui';

export function filterHtml(html) {
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

		return keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`;
	});

	return filteredHtml;
}

export function convertValueToArray(value) {
	if (!options.language) {
		throw new Error('language not set');
	}

	// http://iiif.io/api/presentation/2.1/#language-of-property-values

	if (!(value instanceof Array)) {
		if (typeof value === 'object') {
			if (value['@value']) {
				return [filterHtml(value['@value'])];
			}

			if (value['@id']) {
				const id = filterHtml(value['@id']);
				return [{
					'@id': id,
					label: (value.label ? filterHtml(value.label) : id),
				}];
			}

			return ['(Invalid value)'];
		}

		return [filterHtml(value)];
	}

	const displayedValues = [];
	const translation = {};
	value.forEach((item) => {
		if (typeof item === 'string' || (item['@id'] && item.label)) {
			displayedValues.push(item);
		} else if (item && typeof item !== 'object') {
			displayedValues.push(filterHtml(item));
		} else if (item['@language'] && item['@value']) {
			if (!translation.fallback) {
				translation.fallback = item['@value'];
			}

			if (item['@language'].indexOf('en') === 0) {
				// Language is en or en-US or en-GB
				translation.en = item['@value'];
			} else if (options.language && item['@language'] === options.language) {
				translation.preferred = item['@value'];
			}
		}
	});

	const translatedValue = translation.preferred || translation.en || translation.fallback || null;
	if (translatedValue) {
		displayedValues.push(filterHtml(translatedValue));
	}

	return displayedValues;
}

export function getPageLabel(number, label) {
	return options.pageLabelFormat.replace('P', number).replace('L', label);
}

export function loadManifest(manifestUrl, params = {}) {
	let resolveFunction;
	let rejectFunction;
	const promise = new Promise((resolve, reject) => {
		resolveFunction = resolve;
		rejectFunction = reject;
	});

	return fetchJson(manifestUrl).then(
		async (manifest) => {
			if (params.expectedType && manifest['@type'] !== params.expectedType) {
				setError(`Expected manifest of type ${params.expectedType}, but got ${manifest['@type']}`);
				rejectFunction(error);
				return promise;
			}

			// Force re-render of all components that depend on the manifest
			setManifest(null);
			await nextTick();

			if (manifest['@type'] === 'sc:Manifest') {
				setManifest(manifest);

				// Merging user-set query params with defaults
				initOptions();
				window.addEventListener('popstate', initOptions);

				if (params.reset) {
					updateOptions({
						childManifestUrl: manifestUrl,
						pages: [getStartPage()],
						pan: {},
						rotation: null,
						view: isMobile() ? 'scan' : 'collection',
						zoom: null,
					});
				}

				resolveFunction();
				return promise;
			}

			if (manifest['@type'] === 'sc:Collection') {
				setCollection(manifest);

				const query = new URLSearchParams(window.location.search);
				let queryParams = {};
				try {
					queryParams = JSON.parse(query.get(options.urlQueryKey)) || {};
				} catch {
					// Nothing to do here
				}

				let childManifestUrl = '';

				if (options.urlQueryParams.includes('childManifestUrl') && queryParams.childManifestUrl) {
					childManifestUrl = queryParams.childManifestUrl;
				} else if (collection.manifests && options.childManifestAutoloaded) {
					childManifestUrl = collection.manifests[0]['@id'];
				}

				if (childManifestUrl) {
					await loadManifest(childManifestUrl, { expectedType: 'sc:Manifest' });
					updateOptions({
						childManifestUrl,
					});
				} else {
					const view = queryParams.view || options.view;
					updateOptions({
						view: ['collection', 'help', 'info'].includes(view) ? view : 'collection',
					});
				}

				resolveFunction();
				return promise;
			}

			setError('Please provide a valid IIIF Presentation API 2.x manifest');
			rejectFunction(error);
			return promise;
		},
		(e) => {
			const status = e.response
				? e.response.statusText || e.response.data || e.message
				: e.message;
			setError(`Error loading IIIF manifest: ${status}`);
			rejectFunction(e);
			return promise;
		},
	);
}
