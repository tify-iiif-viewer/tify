import { computed, reactive } from 'vue';

import { errorHandler } from './errorHandler';

export let urlUpdateTimeout; // eslint-disable-line import/no-mutable-exports

const store = reactive({
	collection: {},
	manifest: {},
	options: {},
	translation: {},
});

export const {
	collection,
	manifest,
	options,
	translation,
} = store;

export const canvases = computed(() => (store.manifest.sequences ? store.manifest.sequences[0].canvases : []));

export const pageCount = computed(() => canvases.value.length);

export function getStartPage() {
	const { startCanvas } = store.manifest.sequences[0];
	const startCanvasIndex = canvases.value.findIndex((canvas) => canvas['@id'] === startCanvas);
	return startCanvasIndex >= 0 ? startCanvasIndex + 1 : 1;
}

export function isValidPagesArray(pages) {
	if (!Array.isArray(pages)) {
		return false;
	}

	// Checking for duplicates
	if (new Set(pages).size !== pages.length) {
		return false;
	}

	for (let i = 0, len = pages.length; i < len; i += 1) {
		if (!Number.isInteger(pages[i])
			|| (i > 0 && pages[i] > 0 && pages[i] <= pages[i - 1])
			|| pages[i] < 0
			|| pages[i] > pageCount.value
		) return false;
	}

	return true;
}

export function updateOptions(updatedOptions) {
	Object.assign(store.options, updatedOptions);

	clearTimeout(urlUpdateTimeout);

	if (!store.options.urlQueryKey) {
		return;
	}

	urlUpdateTimeout = setTimeout(() => {
		const storedOptions = {};
		store.options.urlQueryParams.forEach((key) => {
			const param = store.options[key];
			if (param === null
				|| (key === 'pages' && param.length < 2 && param[0] < 2)
				|| (typeof param === 'object' && !Object.keys(param).length)
			) {
				delete storedOptions[key];
			} else {
				storedOptions[key] = store.options[key];
			}
		});

		const url = new URL(window.location);
		url.searchParams.set(store.options.urlQueryKey, JSON.stringify(storedOptions));

		if (!window.history) {
			return;
		}

		if (updatedOptions.pages) {
			errorHandler.clear();
			window.history.pushState({}, '', url);
		} else {
			window.history.replaceState({}, '', url);
		}
	}, 100);
}

export function setCollection(obj) {
	Object.assign(store.collection, obj);
}

export function setManifest(obj) {
	Object.assign(store.manifest, obj);
}

export function setTranslation(obj) {
	Object.assign(store.translation, obj);
}
