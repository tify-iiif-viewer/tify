import { computed, nextTick, reactive } from 'vue';

import { upgrade } from '@iiif/parser/upgrader';

import { isValidPagesArray } from '../modules/validation';

function convertManifest(originalManifest) {
	// For IIIF 2: "related" may be erroneously converted, save for later
	const { related } = originalManifest;

	// Convert IIIF 2 manifest to IIIF 3 (IIIF 3 remains unchanged)
	// NOTE: originalManifest may be modified during conversion
	const manifest = upgrade(originalManifest);

	// For IIIF 2: Restore "related" items
	if (related && originalManifest['@context'] === 'http://iiif.io/api/presentation/2/context.json') {
		[].concat(related).forEach((object) => {
			manifest.homepage = manifest.homepage || [];
			manifest.homepage.push(
				typeof object === 'string'
					? object
					: {
						id: object['@id'],
						label: object.label,
						format: object.format,
					},
			);
		});
	}

	return manifest;
}

function Store(args) {
	const instanceId = `tify-${Math.floor(Math.random() * Date.now())}`;

	const store = reactive({
		collection: null,
		errors: [],
		loading: 0,
		manifest: args.manifest ? convertManifest(args.manifest) : null,
		options: args.options || {},
		rootElement: args.rootElement || null,
		urlUpdateTimeout: null,
		currentStructure: computed(() => {
			if (!(store.manifest.structures instanceof Array)) {
				return false;
			}

			const currentCanvasIds = [];
			store.options.pages.forEach((page) => {
				if (page) {
					currentCanvasIds.push(store.manifest.items[page - 1].id);
				}
			});

			const { length } = store.manifest.structures;
			let indexOfStructureWithSmallestRange;
			let smallestRange;
			for (let i = 0; i < length; i += 1) {
				const structure = store.manifest.structures[i];
				const { items } = structure;
				if (items?.some((item) => currentCanvasIds.includes(item.id))) {
					const currentRange = structure.items.length;
					if (currentRange < smallestRange || !smallestRange) {
						indexOfStructureWithSmallestRange = i;
						smallestRange = currentRange;
						if (smallestRange === 0) {
							break;
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
		isLastSection: computed(() => {
			const { pages } = store.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			return page >= store.sections[store.sections.length - 1].firstPage;
		}),
		pageCount: computed(() => store.manifest.items?.length),
		sections: computed(() => {
			const sections = [];

			if (!store.manifest.structures) {
				return sections;
			}

			store.manifest.structures.forEach((structure) => {
				if (!structure.items) {
					sections.push({ firstPage: 1, lastPage: store.pageCount });
					return;
				}

				const firstCanvasId = structure.items[0].id;
				const firstPage = store.manifest.items.findIndex((canvas) => canvas.id === firstCanvasId) + 1;
				const lastCanvasId = structure.items[structure.items.length - 1].id;
				const lastPage = store.manifest.items.findIndex((canvas) => canvas.id === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});

			return sections;
		}),
		structures: computed(() => {
			if (!store.manifest.structures) {
				return [];
			}

			// TODO: Get rid of Table of Contents if first child without items?
			// See https://digital.blb-karlsruhe.de/i3f/v20/1209510/manifest
			if (store.manifest.structures.some((structure) => structure.type === 'Range')) {
				return store.manifest.structures;
			}

			const mappedStructures = [];
			const canvases = store.manifest.items;
			const structuresCount = store.manifest.structures.length;

			for (let i = 0; i < structuresCount; i += 1) {
				const structure = { ...store.manifest.structures[i] };

				// TODO: Add full behavior support, see https://iiif.io/api/presentation/3.0/#behavior

				if (structure.items) {
					const firstCanvasIdOfStructure = structure.items[0].id;
					structure.firstPage = canvases.findIndex((canvas) => canvas.id === firstCanvasIdOfStructure) + 1;

					const lastCanvasIdOfStructure = structure.items.slice(-1)[0].id;
					structure.lastPage = canvases.findIndex((canvas) => canvas.id === lastCanvasIdOfStructure) + 1;

					if (!canvases[structure.firstPage - 1]) {
						// Excluding structure if its range has no canvases
						continue;
					}
				} else if (canvases?.[0]) {
					structure.firstPage = 1;
					structure.lastPage = store.pageCount;
				}

				structure.level = 0;
				structure.pageCount = structure.lastPage - structure.firstPage + 1;

				mappedStructures.push(structure);
			}

			let maxLevel = 0;
			for (let i = 0; i < mappedStructures.length; i += 1) {
				const structure = mappedStructures[i];

				for (let j = i + 1; j < mappedStructures.length; j += 1) {
					const structure2 = mappedStructures[j];

					if (structure2.firstPage >= structure.firstPage
						&& structure2.lastPage <= structure.lastPage
					) {
						structure.items = (structure.items || []).filter((item) => item.label);
						structure.items.push(structure2);

						structure2.level += 1;
						maxLevel = Math.max(maxLevel, structure2.level);
					}
				}
			}

			// Remove all child structures that are not at their intended level
			// TODO: There may be a simpler and faster solution
			const removeIllegitimateChildren = (structures, level = 0) => {
				for (let i = 0; i < structures.length; i += 1) {
					const structure = structures[i];

					if (structure.level > level) {
						structures.splice(i, 1);
					} else if (structure.items) {
						removeIllegitimateChildren(structure.items, level + 1);
					}
				}
			};

			for (let i = 0; i < maxLevel; i += 1) {
				removeIllegitimateChildren(mappedStructures);
			}

			return mappedStructures;
		}),
		addError(message) {
			store.errors.push(message);
		},
		clearErrors() {
			store.errors = [];
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
			if (!store.manifest.start || !store.manifest.items) {
				return 1;
			}

			const startCanvasIndex = store.manifest.items.findIndex((canvas) => canvas.id === store.manifest.start.id);
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
		goToNextSection() {
			const { pages } = store.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			let sectionIndex = 0;
			while (
				page >= this.sections[sectionIndex].firstPage
				|| (page && page >= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex += 1;
			}
			store.setPage(this.sections[sectionIndex].firstPage);
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
		goToPreviousSection() {
			const { pages } = store.options;
			const page = pages[0] ? pages[0] : pages[1];
			let sectionIndex = this.sections.length - 1;
			while (
				page <= this.sections[sectionIndex].firstPage
				|| (page && page <= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex -= 1;
			}
			store.setPage(this.sections[sectionIndex].firstPage);
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
				async (originalManifest) => {
					const manifest = convertManifest(originalManifest);

					if (params.expectedType && manifest.type !== params.expectedType) {
						const errorMessage = `Expected manifest of type ${params.expectedType}, but got ${manifest.type}`;
						store.addError(errorMessage);
						rejectFunction(errorMessage);
						return promise;
					}

					// Force re-render of all components that depend on the manifest
					store.manifest = null;
					await nextTick();

					if (manifest.type === 'Manifest') {
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

					if (manifest.type === 'Collection') {
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
							childManifestUrl = store.collection.manifests[0].id;
						}

						if (childManifestUrl) {
							await store.loadManifest(childManifestUrl, { expectedType: 'Manifest' });
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

					const errorMessage = 'Please provide a valid IIIF Presentation API manifest';
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
		localize(labelObject) {
			const nbsp = String.fromCharCode(160);
			const separator = `${nbsp}· `;

			if (!store.options.language) {
				throw new Error('language not set');
			}

			if (!labelObject) {
				return '';
			}

			if (typeof labelObject === 'string') {
				return labelObject;
			}

			const label = labelObject[store.options.language]
				|| labelObject[store.options.fallbackLanguage]
				|| Object.values(labelObject)[0];

			const labelString = label instanceof Array
				? label.join(separator)
				: label;

			return (labelString || '').trim() || '—'; // &mdash;
		},
		setPage(pageOrPages) {
			let pages = pageOrPages;
			if (!(pageOrPages instanceof Array)) {
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
	convertManifest,
	install: (app, options = {}) => {
		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$store = new Store(options);
	},
};
