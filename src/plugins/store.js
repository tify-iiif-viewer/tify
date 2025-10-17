import { computed, nextTick, reactive } from 'vue';

import { upgrade } from '@iiif/parser/upgrader';

import { filterHtml } from '../modules/filter';
import { parseCoordinatesString } from '../modules/parsing';
import { createPromise } from '../modules/promise';
import { isValidPagesArray, isValidUrl } from '../modules/validation';

function convertManifest(originalManifest) {
	// For IIIF 2: Some properties are erroneously converted, save for later
	const { related } = originalManifest;
	const { requiredStatement } = originalManifest;
	const { viewingDirection } = originalManifest;

	// Convert IIIF 2 manifest to IIIF 3 (IIIF 3 remains unchanged)
	// NOTE: originalManifest may be modified during conversion
	const manifest = upgrade(originalManifest);

	// Fix converted IIIF 2 manifests
	if (originalManifest['@context'] === 'http://iiif.io/api/presentation/2/context.json') {
		[].concat(related || []).forEach((object) => {
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

		manifest.provider?.forEach((provider, providerIndex) => {
			if (!provider.homepage) {
				return;
			}

			manifest.provider[providerIndex].homepage = provider.homepage
				.filter((providerHomepage) => (
					// Remove provider dummy homepage
					providerHomepage.id !== 'http://example.org/undefined/1'
					// Remove provider homepage if the same URL is already in "homepage"
					&& !manifest.homepage.find((homepage) => homepage.id === providerHomepage.id)
				));
		});

		// Remove dummy provider, restore requiredStatement
		if (manifest.provider?.[0]?.label?.none?.[0] === 'Unknown') {
			delete manifest.provider[0].label;

			if (requiredStatement && !manifest.requiredStatement) {
				manifest.requiredStatement = requiredStatement;
			}
		}

		// Restore viewingDirection
		manifest.viewingDirection = viewingDirection;
	}

	return manifest;
}

function Store(args = {}) {
	const store = reactive({
		annotations: [],
		annotationsAvailable: null,
		collection: null,
		errors: new Set(),
		loading: 0,
		manifest: args.manifest ? convertManifest(args.manifest) : null,
		options: args.options || {},
		readyPromises: [],
		rootElement: args.rootElement || null,
		urlUpdateTimeout: null,
		annotationsActive: computed(() => {
			if (store.options.view === 'text') {
				return true;
			}

			if (!store.options.view && !store.isContainerWidthAtLeast('medium')) {
				return true;
			}

			return false;
		}),
		currentStructure: computed(() => {
			if (!(store.manifest.structures instanceof Array)) {
				return false;
			}

			const currentCanvasIds = [];
			store.options.pages.filter((page) => page > 0).forEach((page) => {
				currentCanvasIds.push(store.manifest.items[page - 1].id);
			});

			const { length } = store.manifest.structures;
			let indexOfStructureWithSmallestRange;
			let smallestRange;
			for (let i = length - 1; i >= 0; i -= 1) {
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

			if (pages.length === 1) {
				return false;
			}

			if (pages.length > 2) {
				return true;
			}

			if (pages[0] < 1 || pages[1] < 1) {
				return false;
			}

			return (pages[1] - pages[0] !== 1);
		}),
		isFirstPage: computed(() => store.options.pages[0] === 1 || store.options.pages[1] === 1),
		isLastPage: computed(() => store.options.pages.at(-1) === store.pageCount),
		isLastSection: computed(() => {
			const { pages } = store.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			return page >= store.sections[store.sections.length - 1]?.firstPage;
		}),
		isReversed: computed(() => ['right-to-left', 'bottom-to-top'].includes(store.manifest.viewingDirection)),
		isVertical: computed(() => ['top-to-bottom', 'bottom-to-top'].includes(store.manifest.viewingDirection)),
		pageCount: computed(() => store.manifest?.items?.length),
		sections: computed(() => {
			if (!store.manifest.structures) {
				return [];
			}

			const sections = [];

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
			if (!store.manifest?.structures) {
				return [];
			}

			if (store.manifest.structures.some((structure) => structure.type === 'Range')) {
				return store.manifest.structures.length === 1
					&& store.manifest.structures[0].behavior?.includes('top')
					? (store.manifest.structures[0].items || [])
					: store.manifest.structures;
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

					const lastCanvasIdOfStructure = structure.items.at(-1).id;
					structure.lastPage = canvases.findIndex((canvas) => canvas.id === lastCanvasIdOfStructure) + 1;

					if (!canvases[structure.firstPage - 1]) {
						// Excluding structure if its range has no canvases
						continue; // eslint-disable-line no-continue
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
			store.errors.add(message);
			console.warn(message); // eslint-disable-line no-console
		},
		clearErrors() {
			store.errors.clear();
		},
		async fetchJson(url) {
			store.loading += 1;

			const response = await fetch(url).catch((error) => {
				store.loading = 0;
				return Promise.reject(error);
			});

			if (!response.ok) {
				store.loading = 0;
				return Promise.reject(new Error(response.status));
			}

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

			if (!response.ok) {
				console.warn('Error loading annotation'); // eslint-disable-line no-console
				return '';
			}

			const result = await response.text().catch((error) => {
				store.loading = 0;
				return Promise.reject(error);
			});

			if (store.loading > 0) {
				store.loading -= 1;
			}

			return result;
		},
		getFacingPage(page) {
			// Special return values:
			//  0: Placeholder facing page for the first page or a verso last page
			// -1: Marker for non-paged pages in a paged document to retain double-page mode

			// If the current page is non-paged, just return the marker
			if (store.manifest.items[page - 1].behavior?.includes('non-paged')) {
				return -1;
			}

			// The first page is always displayed individually
			if (page === 1) {
				return 0;
			}

			const precedingNonPagedItems = store.manifest.items
				.slice(0, page - 1)
				.filter((item) => item.behavior?.includes('non-paged'));
			const offsetPage = page + (precedingNonPagedItems.length % 2);

			// For an odd (recto) page, add the preceding page unless it is non-paged
			if (offsetPage % 2 === 1) {
				if (store.manifest.items[(page - 1) - 1]?.behavior?.includes('non-paged')) {
					return -1;
				}

				return page - 1;
			}

			// For an even (verso) page, add the following page if available, unless it is non-paged
			if (store.manifest.items[(page - 1) + 1]?.behavior?.includes('non-paged')) {
				return -1;
			}

			return page < store.pageCount
				? page + 1
				: 0;
		},
		getPageLabel(number, labelObject) {
			const label = store.localize(labelObject, '');

			if (label) {
				return store.options.pageLabelFormat.replace('P', number).replace('L', label);
			}

			return store.options.pageLabelFormat.includes('P')
				? `${number}`
				: '—'; // &mdash;
		},
		getStartPages() {
			let startPage = 1;

			if (store.manifest.items && store.manifest.start) {
				const startCanvasIndex = store.manifest.items.findIndex(
					(canvas) => canvas.id === store.manifest.start.id,
				);
				startPage = startCanvasIndex >= 0 ? startCanvasIndex + 1 : 1;
			}

			if (store.isContainerWidthAtLeast('medium')
				&& store.manifest.behavior?.includes('paged')
			) {
				return [startPage, store.getFacingPage(startPage)].sort();
			}

			return [startPage];
		},
		getThumbnailUrl(page, thumbnailWidth, itemIndex = 0, layerIndex = 0) {
			const canvas = store.manifest.items[page - 1];

			const thumbnail = canvas.thumbnail?.[0];
			if (thumbnail?.id
				&& thumbnail?.width >= thumbnailWidth
			) {
				return thumbnail.id;
			}

			const body = canvas.items?.[0]?.items?.[itemIndex]?.body;
			const resource = body?.items ? body.items[layerIndex] : body;
			const thumbnailService = thumbnail?.service || resource?.source?.service || resource?.service;
			if (thumbnailService) {
				const service = [].concat(thumbnailService)[0];
				const quality = ['ImageService2', 'ImageService3'].includes(service.type || service['@type'])
					? 'default'
					: 'native';
				const id = service.id || service['@id'];

				// Use recommended (and probably cached) size if possible
				let width = thumbnailWidth;
				if (thumbnail?.service) {
					service.sizes?.forEach((size) => {
						if (size.width >= width && size.width <= width * 2) {
							width = size.width;
						}
					});
				}

				// TODO: Add support for store.options.preferredImageFormat
				const format = 'jpg';
				const slash = id.at(-1) === '/' ? '' : '/';
				return `${id}${slash}full/${width},/0/${quality}.${format}`;
			}

			if (resource?.type === 'Image') {
				return thumbnail?.id || resource?.id;
			}

			return '';
		},
		goToFirstPage() {
			store.setPage(1);
		},
		goToNextPage() {
			const currentPage = store.options.pages.at(-1);
			if (currentPage < store.pageCount) {
				store.setPage(currentPage + 1);
			}
		},
		goToNextSection() {
			const { pages } = store.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			let sectionIndex = 0;
			while (page >= store.sections[sectionIndex].firstPage
				|| (page && page >= store.sections[sectionIndex].firstPage)
			) {
				sectionIndex += 1;
			}
			store.setPage(store.sections[sectionIndex].firstPage);
		},
		goToLastPage() {
			store.setPage(store.pageCount);
		},
		goToPreviousPage() {
			const currentPage = store.options.pages.find((page) => page > 0);
			if (currentPage > 1) {
				store.setPage(currentPage - 1);
			}
		},
		goToPreviousSection() {
			const { pages } = store.options;
			const page = pages[0] ? pages[0] : pages[1];
			let sectionIndex = store.sections.length - 1;
			while (page <= store.sections[sectionIndex].firstPage
				|| (page && page <= store.sections[sectionIndex].firstPage)
			) {
				sectionIndex -= 1;
			}
			store.setPage(store.sections[sectionIndex].firstPage);
		},
		isContainerWidthAtLeast(size) {
			return store.rootElement
				&& window.getComputedStyle(store.rootElement, '::after').content.includes(size);
		},
		loadAnnotations() {
			store.annotationsAvailable = null;

			store.options.pages?.filter((page) => page > 0).forEach(async (page) => {
				if (store.annotations[page]) {
					return;
				}

				const canvas = store.manifest.items[page - 1];
				if (!('annotations' in canvas)) {
					store.annotationsAvailable = false;
					return;
				}

				store.annotations[page] = [];

				let resources = canvas.annotations[0].items;

				if (!resources) {
					const annotationListUrl = canvas.annotations[0].id;

					try {
						const annotationList = await store.fetchJson(annotationListUrl);
						resources = annotationList.resources || annotationList.items;
					} catch (error) {
						const status = error.response ? error.response.statusText : error.message;
						// eslint-disable-next-line no-console
						console.warn(`Could not load annotations: ${status}`);
						store.annotationsAvailable = false;
						return;
					}
				}

				if (!(resources instanceof Array)) {
					return;
				}

				resources.forEach(async (resource, index) => {
					let html;

					const annotationId = resource.id
						|| resource['@id']
						|| resource.resource?.id
						|| resource.resource?.['@id'];

					if (resource.resource?.chars) {
						html = resource.resource.chars;
					} else if (resource.resource?.[0]?.chars) {
						html = resource.resource?.[0]?.chars;
					} else if (resource.resource?.label) {
						html = `<i>${resource.resource.label}</i>`;
					} else {
						const items = [].concat(resource.body);
						const strings = await Promise.all(items.map(async (item) => {
							if (item?.type === 'Image') {
								return `<img src="${item.id}" alt="">`;
							}

							if (item?.value) {
								return item.value;
							}

							if (item?.body?.value) {
								return item.body.value;
							}

							const url = item?.items?.[0].id
								|| item?.body?.id
								|| item?.body?.['@id']
								|| item?.id
								|| annotationId;

							if (isValidUrl(url)) {
								return store.fetchText(url);
							}

							return '';
						}));

						html = strings.join('<br>');
					}

					if (!html) {
						return;
					}

					if ((resource.format || resource.body?.format) === 'text/plain') {
						html = html.replace(/\n/g, ' <br>');
					}

					store.annotationsAvailable = true;

					const annotation = {
						id: annotationId,
						html: filterHtml(html),
					};

					const coordinatesString = resource.on?.selector?.value
						|| (typeof resource.on === 'string' ? resource.on : null)
						|| resource.target?.id
						|| resource.target
						|| '';

					const coords = parseCoordinatesString(coordinatesString);
					if (coords?.length === 4) {
						annotation.coords = coords;
					}

					store.annotations[page][index] = annotation;
				});
			});
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

			// For backwards compatibility
			if (params.view === 'fulltext') {
				params.view = 'text';
			} else if (['scan', ''].includes(params.view)) {
				params.view = null;
			}

			if (params.pages && !isValidPagesArray(params.pages, store.pageCount)) {
				store.addError('Invalid pages, reset to start page');
				params.pages = null;
			}

			store.options.urlQueryParams.forEach((key) => {
				store.options[key] = params[key] ?? store.options[key];
			});

			// Special handling for some params
			store.options.pages = caller && caller.type === 'popstate'
				? params.pages || store.getStartPages()
				: params.pages || store.options.pages || store.getStartPages();
			store.options.pan = params.panX || params.panY
				? { x: params.panX, y: params.panY }
				: params.pan || store.options.pan;
			store.options.rotation = parseInt(params.rotation, 10) || store.options.rotation;
			store.options.view = params.view || params.view === ''
				? params.view
				: store.options.view;
			store.options.zoom = parseFloat(params.zoom) || store.options.zoom;
		},
		loadManifest(manifestUrl, params = {}) {
			const promise = createPromise();

			return store.fetchJson(manifestUrl).then(
				async (originalManifest) => {
					const manifest = convertManifest(originalManifest);

					if (params.expectedType && manifest.type !== params.expectedType) {
						const errorMessage = `Expected manifest of type ${params.expectedType}, but got ${manifest.type}`;
						store.addError(errorMessage);
						promise.reject(errorMessage);
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
								pages: store.getStartPages(),
								pan: {},
								rotation: null,
								view: store.isContainerWidthAtLeast('medium') ? 'collection' : null,
								zoom: null,
							});
						}

						promise.resolve();
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

						if (store.options.urlQueryParams.includes('childManifestUrl')
							&& queryParams.childManifestUrl
						) {
							childManifestUrl = queryParams.childManifestUrl;
						} else if (store.collection.manifests
							&& store.options.childManifestAutoloaded
						) {
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

						promise.resolve();
						return promise;
					}

					const errorMessage = 'Please provide a valid IIIF Presentation API manifest';
					store.addError(errorMessage);
					promise.reject(errorMessage);
					return promise;
				},
				(error) => {
					const status = error.response
						? error.response.statusText || error.response.data || error.message
						: error.message;
					const errorMessage = `Error loading IIIF manifest: ${status}`;
					store.addError(errorMessage);
					promise.reject(errorMessage);
					return promise;
				},
			);
		},
		localize(labelObject) {
			const nbsp = '\u00A0';
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
				|| Object.values(labelObject)[0]
				|| '';

			return ([].concat(label).join(separator) || '').trim();
		},
		setPage(pageOrPages) {
			let pages = [].concat(pageOrPages);

			if (!isValidPagesArray(pages, store.pageCount)) {
				throw new RangeError('Invalid pages');
			}

			if (pages.length === 1
				&& store.options.pages?.length === 2
				&& !this.isCustomPageView
			) {
				pages = [pages[0], store.getFacingPage(pages[0])].sort();
			}

			store.updateOptions({ pages });
			return pages;
		},
		toggleAnnotationId(annotationId) {
			const options = {
				annotationId: store.options.annotationId === annotationId ? null : annotationId,
				annotationsVisible: store.options.annotationId ? null : store.annotationsVisible,
			};

			if (options.annotationId && !store.isContainerWidthAtLeast('medium')) {
				options.view = store.options.view ? null : 'text';
			}

			store.updateOptions(options);
		},
		updateOptions(updatedOptions) {
			clearTimeout(store.urlUpdateTimeout);

			Object.assign(store.options, updatedOptions);

			if (updatedOptions.pages) {
				store.clearErrors();
			}

			if (!store.options.urlQueryKey) {
				return;
			}

			store.urlUpdateTimeout = setTimeout(() => {
				const storedOptions = {};
				store.options.urlQueryParams.forEach((key) => {
					const param = store.options[key];
					if (param === null
						|| (key === 'layers' && !param.some(Boolean))
						|| (key === 'pages' && param.toString() === store.getStartPages().toString())
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

				if (updatedOptions.pages || updatedOptions.view) {
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
