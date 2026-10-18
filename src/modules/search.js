import { parseCoordinatesString } from './parsing';

// Ordered by preference
const searchServiceVersions = [
	{
		version: 2,
		types: ['SearchService2'],
		profiles: ['http://iiif.io/api/search/2/search'],
	},
	{
		version: 1,
		types: ['SearchService1'],
		profiles: [
			'http://iiif.io/api/search/1/search',
			'http://iiif.io/api/search/0/search',
		],
	},
];

function getId(object) {
	if (typeof object === 'string') {
		return object;
	}

	return object?.id || object?.['@id'] || null;
}

function getFirst(value) {
	return value instanceof Array ? value[0] : value;
}

function getText(value) {
	if (typeof value === 'string') {
		return value;
	}

	if (value instanceof Array) {
		return value.map(getText).filter(Boolean).join(' ');
	}

	return value?.value || value?.chars || '';
}

/**
 * Returns the IIIF Content Search service of a manifest, i.e. an object with
 * the service URL (`id`) and the API `version` (1 or 2), or `null` if the
 * manifest has no supported search service. Version 2 is preferred.
 *
 * @param {?object} manifest
 * @returns {?{id: string, version: number}}
 */
export function getSearchService(manifest) {
	const services = [].concat(manifest?.service || [], manifest?.services || []);

	for (let i = 0; i < searchServiceVersions.length; i += 1) {
		const { version, types, profiles } = searchServiceVersions[i];
		const service = services.find((candidate) => candidate
			&& getId(candidate)
			&& (types.includes(candidate.type || candidate['@type'])
				|| profiles.includes(candidate.profile)));

		if (service) {
			return { id: getId(service), version };
		}
	}

	return null;
}

/**
 * Builds the URL of a search request.
 *
 * @param {string} serviceUrl
 * @param {string} query
 * @returns {string}
 */
export function getSearchUrl(serviceUrl, query) {
	const url = new URL(serviceUrl);
	url.searchParams.set('q', query);
	return url.toString();
}

function getTarget(annotation) {
	// IIIF Search 1: `on`; IIIF Search 2: `target`
	const target = getFirst(annotation.target || annotation.on);

	if (typeof target === 'string') {
		const [canvasId, fragment] = target.split('#');
		return { canvasId, coords: parseCoordinatesString(fragment ? `#${fragment}` : null) };
	}

	const canvasId = getId(target?.source || target?.full);
	const selector = getFirst(target?.selector);

	return { canvasId, coords: parseCoordinatesString(selector?.value) };
}

/**
 * Normalizes a IIIF Content Search 1 or 2 response, returning the total
 * number of results (if provided), the URL of the next result page (if any)
 * and the hits, each with the page number, coordinates (if any), the matched
 * text and its context (if provided).
 *
 * @param {object} response
 * @param {object} manifest
 * @returns {{total: ?number, next: ?string, hits: Array.<object>}}
 */
export function parseSearchResponse(response, manifest) {
	const pageByCanvasId = {};
	manifest.items?.forEach((canvas, index) => {
		pageByCanvasId[canvas.id] = index + 1;
	});

	const items = [].concat(response.items || response.resources || []).filter(Boolean);

	// Search 2 provides context as additional annotations, which some servers
	// erroneously include in `items`; Search 1 provides context as hits
	const contextAnnotations = items.filter((item) => item.motivation === 'contextualizing');
	[].concat(response.annotations || []).forEach((annotationPage) => {
		contextAnnotations.push(...[].concat(annotationPage?.items || []));
	});

	const contextByAnnotationId = {};
	contextAnnotations.forEach((annotation) => {
		[].concat(annotation?.target || []).forEach((target) => {
			const selector = [].concat(target?.selector || [])
				.find((candidate) => candidate?.type === 'TextQuoteSelector');
			const annotationId = getId(target?.source);
			if (selector && annotationId) {
				contextByAnnotationId[annotationId] = {
					before: selector.prefix || '',
					match: selector.exact || '',
					after: selector.suffix || '',
				};
			}
		});
	});

	[].concat(response.hits || []).forEach((hit) => {
		const annotationIds = [].concat(hit?.annotations || []);
		annotationIds.forEach((annotationId, index) => {
			contextByAnnotationId[annotationId] = {
				before: index === 0 ? hit.before || '' : '',
				match: hit.match || '',
				after: index === annotationIds.length - 1 ? hit.after || '' : '',
			};
		});
	});

	const hits = [];
	items.forEach((annotation, index) => {
		if (annotation.motivation === 'contextualizing') {
			return;
		}

		const { canvasId, coords } = getTarget(annotation);
		const page = pageByCanvasId[canvasId];
		if (!page) {
			return;
		}

		const id = getId(annotation) || `${canvasId}#${index}`;
		const context = contextByAnnotationId[id] || {};

		hits.push({
			id,
			page,
			coords,
			text: getText(annotation.body || annotation.resource) || context.match || '',
			before: context.before || '',
			after: context.after || '',
		});
	});

	let next = getId(response.next) || getId(response.within?.next) || null;
	if (next === getId(response)) {
		next = null;
	}

	// Without further result pages, counting is more reliable than the total
	// provided by the server, which may include non-hit annotations
	const total = response.partOf?.total ?? response.within?.total;

	return {
		total: next && Number.isInteger(total) ? total : hits.length,
		next,
		hits,
	};
}
