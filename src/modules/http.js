import { ref } from 'vue';

import { setError } from './error';
import { getStartPage, isValidPagesArray, options } from './store';
import { isMobile } from './ui';

export const loading = ref(0);

export async function fetchJson(...args) {
	const [resource, config] = args;

	// For unit tests
	if (import.meta.env.TEST) {
		return new Promise((resolve, reject) => {
			if (resource === '/de.json') {
				resolve({});
			} else {
				reject(new Error());
			}
		});
	}

	loading.value += 1;

	const response = await fetch(resource, config).catch((error) => {
		loading.value = 0;
		return Promise.reject(error);
	});

	const result = await response.json().catch((error) => {
		loading.value = 0;
		return Promise.reject(error);
	});

	if (loading.value > 0) {
		loading.value -= 1;
	}

	return result;
}

export async function fetchText(...args) {
	const [resource, config] = args;

	loading.value += 1;

	const response = await fetch(resource, config).catch((error) => {
		loading.value = 0;
		return Promise.reject(error);
	});

	const result = await response.text().catch((error) => {
		loading.value = 0;
		return Promise.reject(error);
	});

	if (loading.value > 0) {
		loading.value -= 1;
	}

	return result;
}

export function readOptionsFromUrlQuery(caller) {
	let params = {};

	try {
		const query = new URLSearchParams(window.location.search);
		params = JSON.parse(query.get(options.urlQueryKey)) || {};
	} catch {
		// Nothing to do here
	}

	// NOTE: params.view can be an empty string (showing only the scan on large screens)
	if (params.view === '' && isMobile()) {
		params.view = 'scan';
	}

	if (params.pages && !isValidPagesArray(params.pages)) {
		setError('Invalid pages, reset to start page');
		params.pages = null;
	}

	options.childManifestUrl = params.childManifestUrl || options.childManifestUrl;
	options.filters = params.filters || options.filters;
	options.pages = caller && caller.type === 'popstate'
		? params.pages || [getStartPage()]
		: params.pages || options.pages || [getStartPage()];
	options.pan = params.panX || params.panY
		? { x: params.panX, y: params.panY }
		: params.pan || options.pan;
	options.rotation = parseInt(params.rotation, 10) || options.rotation;
	options.view = params.view || params.view === ''
		? params.view
		: options.view;
	options.zoom = parseFloat(params.zoom) || options.zoom;
}

export function setLoading(value = 1) {
	loading.value = value;
}
