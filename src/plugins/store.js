import { computed, nextTick, reactive } from 'vue';

import { filterHtml } from '../modules/filter';
import { isValidPagesArray } from '../modules/validation';

function Store(args) {
	const instanceId = `tify-${Math.floor(Math.random() * Date.now())}`;

	const store = reactive({
		collection: null,
		errors: [],
		loading: 0,
		manifest: args.manifest || null,
		options: args.options || {},
		rootElement: args.rootElement || null,
		urlUpdateTimeout: null,
		canvases: computed(() => (
			store.manifest && store.manifest.sequences
				? store.manifest.sequences[0].canvases
				: []
		)),
		currentStructure: computed(() => {
			if (!Array.isArray(store.manifest.structures)) {
				return false;
			}

			const currentCanvasIds = [];
			store.options.pages.forEach((page) => {
				if (page) {
					currentCanvasIds.push(store.manifest.sequences[0].canvases[page - 1]['@id']);
				}
			});

			const { length } = store.manifest.structures;
			let indexOfStructureWithSmallestRange;
			let smallestRange;
			for (let i = 0; i < length; i += 1) {
				const structure = store.manifest.structures[i];
				const { canvases } = structure;
				if (canvases && canvases.some((canvasId) => currentCanvasIds.includes(canvasId))) {
					if (structure.firstPage && structure.lastPage) {
						const currentRange = structure.lastPage - structure.firstPage;
						if (currentRange < smallestRange || !smallestRange) {
							indexOfStructureWithSmallestRange = i;
							smallestRange = currentRange;
							if (smallestRange === 0) {
								break;
							}
						}
					}
				}
			}

			if (typeof indexOfStructureWithSmallestRange === 'number'
			&& indexOfStructureWithSmallestRange >= 0
			) {
				return store.manifest.structures[indexOfStructureWithSmallestRange];
			}

			return false;
		}),
		isCustomPageView: computed(() => {
			const { pages } = store.options;

			if (!pages) {
				return false;
			}

			return pages.length > 2
				|| (pages.length === 2 && (pages[0] % 2 > 0 || pages[1] !== pages[0] + 1) && pages[1] > 0);
		}),
		isFirstPage: computed(() => store.options.pages[0] < 2),
		isLastPage: computed(() => {
			const { pages } = store.options;
			return pages[0] >= store.pageCount || pages[pages.length - 1] >= store.pageCount;
		}),
		pageCount: computed(() => store.canvases.length),
		structures: computed(() => {
			if (!store.manifest.structures) {
				return [];
			}

			const mappedStructures = [];
			const structuresThatAreChildren = [];
			const { canvases } = store.manifest.sequences[0];
			const { length } = store.manifest.structures;
			for (let i = 0; i < length; i += 1) {
				const structure = store.manifest.structures[i];

				// https://iiif.io/api/presentation/2.1/#viewinghint
				if (structure.viewingHint === 'top') {
					continue;
				}

				if (structure.label) {
					structure.label = store.convertValueToArray(structure.label)[0].trim();
				} else {
					structure.label = '—'; // NOTE: That is an em dash (&mdash;)
				}

				if (structure.canvases) {
					const firstCanvas = structure.canvases[0];
					structure.firstPage = canvases.findIndex((canvas) => canvas['@id'] === firstCanvas) + 1;

					const lastCanvas = structure.canvases[structure.canvases.length - 1];
					structure.lastPage = canvases.findIndex((canvas) => canvas['@id'] === lastCanvas) + 1;

					const firstPageCanvas = canvases[structure.firstPage - 1];
					if (!firstPageCanvas) {
						// Excluding structure if its range has no canvases
						continue;
					}

					structure.pageLabel = firstPageCanvas.label;
				} else if (canvases[0]) {
					structure.firstPage = 1;
					structure.lastPage = store.pageCount;
					structure.pageLabel = canvases[0].label;
				}

				structure.pageCount = structure.lastPage - structure.firstPage + 1;

				if (structure.within) {
					structuresThatAreChildren.push(structure);
				}

				mappedStructures.push(structure);
			}

			const structuresThatAreChildrenLength = structuresThatAreChildren.length;
			for (let i = 0; i < length; i += 1) {
				const childStructures = [];
				for (let j = 0; j < structuresThatAreChildrenLength; j += 1) {
					const childStructure = structuresThatAreChildren[j];
					if (childStructure.within === mappedStructures[i]['@id']) {
						childStructures.push(childStructure);
					}
				}

				if (childStructures.length) {
					mappedStructures[i].childStructures = childStructures.sort((a, b) => a.firstPage - b.firstPage);
				}
			}

			const topLevelStructures = mappedStructures
				.filter((structure) => !structure.within)
				.sort((a, b) => a.firstPage - b.firstPage);

			return topLevelStructures;
		}),
		addError(message) {
			store.errors.push(message);
		},
		clearErrors() {
			store.errors = [];
		},
		convertValueToArray(value) {
			if (!store.options.language) {
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
					} else if (store.options.language && item['@language'] === store.options.language) {
						translation.preferred = item['@value'];
					}
				}
			});

			const translatedValue = translation.preferred || translation.en || translation.fallback || null;
			if (translatedValue) {
				displayedValues.push(filterHtml(translatedValue));
			}

			return displayedValues;
		},
		async fetchJson(url) {
			store.loading += 1;

			const response = await fetch(url).catch((error) => {
				store.loading = 0;
				return Promise.reject(error);
			});

			const result = await response.json().catch((error) => {
				store.loading = 0;
				return Promise.reject(error);
			});

			if (store.loading > 0) {
				store.loading -= 1;
			}

			return result;
		},
		async fetchText(url) {
			store.loading += 1;

			const response = await fetch(url).catch((error) => {
				store.loading = 0;
				return Promise.reject(error);
			});

			const result = await response.text().catch((error) => {
				store.loading = 0;
				return Promise.reject(error);
			});

			if (store.loading > 0) {
				store.loading -= 1;
			}

			return result;
		},
		getId(postfix) {
			return instanceId + (postfix ? `-${postfix}` : '');
		},
		getPageLabel(number, label) {
			return store.options.pageLabelFormat.replace('P', number).replace('L', label);
		},
		getStartPage() {
			const { startCanvas } = store.manifest.sequences[0];
			const startCanvasIndex = store.canvases.findIndex((canvas) => canvas['@id'] === startCanvas);
			return startCanvasIndex >= 0 ? startCanvasIndex + 1 : 1;
		},
		goToFirstPage() {
			store.setPage(1);
		},
		goToNextPage() {
			let page = store.options.pages[0] + 1;
			if (store.options.pages.length > 1 && page % 2 > 0 && page < store.pageCount) {
				page += 1;
			}

			store.setPage(page);
		},
		goToLastPage() {
			store.setPage(store.pageCount);
		},
		goToPreviousPage() {
			let page = store.options.pages[0] - 1;
			if (store.options.pages.length > 1 && page % 2 > 0 && page > 0) {
				page -= 1;
			}

			store.setPage(page);
		},
		initOptions(caller) {
			let params = {};

			if (store.options.urlQueryKey) {
				try {
					const query = new URLSearchParams(window.location.search);
					params = JSON.parse(query.get(store.options.urlQueryKey)) || {};
				} catch {
					// Nothing to do here
				}
			}

			// NOTE: params.view can be an empty string (showing only the scan on large screens)
			if (params.view === '' && store.isMobile()) {
				params.view = 'scan';
			}

			if (params.pages && !isValidPagesArray(params.pages, store.pageCount)) {
				store.addError('Invalid pages, reset to start page');
				params.pages = null;
			}

			store.options.childManifestUrl = params.childManifestUrl || store.options.childManifestUrl;
			store.options.filters = params.filters || store.options.filters;
			store.options.pages = caller && caller.type === 'popstate'
				? params.pages || [store.getStartPage()]
				: params.pages || store.options.pages || [store.getStartPage()];
			store.options.pan = params.panX || params.panY
				? { x: params.panX, y: params.panY }
				: params.pan || store.options.pan;
			store.options.rotation = parseInt(params.rotation, 10) || store.options.rotation;
			store.options.view = params.view || params.view === ''
				? params.view
				: store.options.view;
			store.options.zoom = parseFloat(params.zoom) || store.options.zoom;
		},
		isMobile() {
			return store.rootElement.offsetWidth < store.options.breakpoints.medium;
		},
		loadManifest(manifestUrl, params = {}) {
			let resolveFunction;
			let rejectFunction;
			const promise = new Promise((resolve, reject) => {
				resolveFunction = resolve;
				rejectFunction = reject;
			});

			return store.fetchJson(manifestUrl).then(
				async (manifest) => {
					if (params.expectedType && manifest['@type'] !== params.expectedType) {
						const errorMessage = `Expected manifest of type ${params.expectedType}, but got ${manifest['@type']}`;
						store.addError(errorMessage);
						rejectFunction(errorMessage);
						return promise;
					}

					// Force re-render of all components that depend on the manifest
					store.manifest = null;
					await nextTick();

					if (manifest['@type'] === 'sc:Manifest') {
						store.manifest = manifest;

						// Merging user-set query params with defaults
						store.initOptions();
						window.addEventListener('popstate', store.initOptions);

						if (params.reset) {
							store.updateOptions({
								childManifestUrl: manifestUrl,
								pages: [store.getStartPage()],
								pan: {},
								rotation: null,
								view: store.isMobile() ? 'scan' : 'collection',
								zoom: null,
							});
						}

						resolveFunction();
						return promise;
					}

					if (manifest['@type'] === 'sc:Collection') {
						store.collection = manifest;

						const query = new URLSearchParams(window.location.search);
						let queryParams = {};
						try {
							queryParams = JSON.parse(query.get(store.options.urlQueryKey)) || {};
						} catch {
							// Nothing to do here
						}

						let childManifestUrl = '';

						if (store.options.urlQueryParams.includes('childManifestUrl') && queryParams.childManifestUrl) {
							childManifestUrl = queryParams.childManifestUrl;
						} else if (store.collection.manifests && store.options.childManifestAutoloaded) {
							childManifestUrl = store.collection.manifests[0]['@id'];
						}

						if (childManifestUrl) {
							await store.loadManifest(childManifestUrl, { expectedType: 'sc:Manifest' });
							store.updateOptions({
								childManifestUrl,
							});
						} else {
							const view = queryParams.view || store.options.view;
							store.updateOptions({
								view: ['collection', 'help', 'info'].includes(view) ? view : 'collection',
							});
						}

						resolveFunction();
						return promise;
					}

					const errorMessage = 'Please provide a valid IIIF Presentation API 2.x manifest';
					store.addError(errorMessage);
					rejectFunction(errorMessage);
					return promise;
				},
				(error) => {
					const status = error.response
						? error.response.statusText || error.response.data || error.message
						: error.message;
					const errorMessage = `Error loading IIIF manifest: ${status}`;
					store.addError(errorMessage);
					rejectFunction(errorMessage);
					return promise;
				},
			);
		},
		setPage(pageOrPages) {
			let pages = pageOrPages;
			if (!Array.isArray(pageOrPages)) {
				pages = [pageOrPages];
			}

			if (!isValidPagesArray(pages, store.pageCount)) {
				throw new RangeError('Invalid pages');
			}

			if (pages.length === 1
				&& store.options.pages
				&& store.options.pages[0] % 2 < 1
				&& (store.options.pages[1] === store.options.pages[0] + 1 || store.options.pages[1] === 0)
			) {
				const p = pages[0] % 2 > 0 ? pages[0] - 1 : pages[0];
				pages = [p, p === store.pageCount ? 0 : p + 1];
			}

			store.updateOptions({ pages });
			return pages;
		},
		updateOptions(updatedOptions) {
			Object.assign(store.options, updatedOptions);

			clearTimeout(store.urlUpdateTimeout);

			if (!store.options.urlQueryKey) {
				return;
			}

			store.urlUpdateTimeout = setTimeout(() => {
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
				if (Object.keys(storedOptions).length) {
					url.searchParams.set(store.options.urlQueryKey, JSON.stringify(storedOptions));
				} else {
					url.searchParams.delete(store.options.urlQueryKey);
				}

				if (!window.history) {
					return;
				}

				if (updatedOptions.pages) {
					store.clearErrors();
					window.history.pushState({}, '', url);
				} else {
					window.history.replaceState({}, '', url);
				}
			}, 100);
		},
	});

	return store;
}

export default {
	install: (app, options = {}) => {
		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$store = new Store(options);
	},
};
