<script>
import OpenSeadragon from 'openseadragon';

import { parseCoordinatesString } from '../modules/parsing';
import { preventEvent } from '../modules/keyboard';
import { createPromise } from '../modules/promise';

const gapBetweenPages = 0.005;
const zoomFactor = 1.5;

export default {
	data() {
		return {
			defaultCanvasCss: '',
			loadingTimeout: null,
			avResource: null,
			overlayElements: [],
			promise: createPromise(),
			tileSources: [],
			viewer: null,
			viewerState: {
				// NOTE: See updateViewerState()
				isReset: true,
			},
		};
	},
	computed: {
		filtersActive() {
			return Object.keys(this.$store.options.filters).length > 0;
		},
		paginationButtons() {
			const positions = this.$store.manifest.viewingDirection?.split('-to-') || ['left', 'right'];

			const buttons = [
				{
					hidden: this.$store.isFirstPage,
					title: this.$translate('Previous page'),
					onClick: this.$store.goToPreviousPage,
					position: positions[0],
				},
				{
					hidden: this.$store.isLastPage,
					title: this.$translate('Next page'),
					onClick: this.$store.goToNextPage,
					position: positions[1],
				},
			];

			if (this.$store.isReversed) {
				buttons.reverse();
			}

			return buttons.filter((button) => !button.hidden);
		},
		multiLayerResources() {
			return this.$store.options.pages.filter((page) => page > 0).map((page, pageIndex) => ({
				pageIndex,
				items: this.$store.manifest.items[page - 1].items?.[0]?.items?.[0]?.body?.items,
			})).filter((resource) => resource.items?.length > 1);
		},
	},
	watch: {
		'$store.annotations': {
			// TODO: This may be called more often than required, yet limiting
			// calls to the currently visible pages leads to missing annotations
			handler() {
				this.updateOverlays();
			},
			deep: true,
		},
		// eslint-disable-next-line func-names
		'$store.options.annotationId': function (annotationId) {
			if (!this.viewer) {
				return;
			}

			this.overlayElements
				.find((element) => element.classList.contains('-current'))
				?.classList
				.remove('-current');

			if (!annotationId) {
				return;
			}

			// Pan current annotation overlay into view if outside of viewport bounds
			const viewportBounds = this.viewer.viewport.getBounds();
			const overlayElement = this.overlayElements.find((element) => element.id === annotationId);

			if (!overlayElement) {
				return;
			}

			overlayElement.classList.add('-current');

			const overlay = this.viewer.getOverlayById(overlayElement);
			const overlayBounds = overlay.getBounds(this.viewer.viewport);

			if (!viewportBounds.intersection(overlayBounds)) {
				// Add a bit of margin
				overlayBounds.x -= 0.03;
				overlayBounds.y -= 0.03;
				overlayBounds.width += 0.06;
				overlayBounds.height += 0.06;

				this.viewer.viewport.fitBoundsWithConstraints(overlayBounds);
			}
		},
		// eslint-disable-next-line func-names
		'$store.options.pages': function (newValue, oldValue) {
			const reset = newValue.length !== oldValue.length;
			this.loadInfo(reset);
		},
		// eslint-disable-next-line func-names
		'$store.options.view': function () {
			this.updateOverlays();
		},
	},
	mounted() {
		this.loadInfo();

		this.$store.readyPromises.push(this.promise);

		// TODO: Add a function for adding/removing global event listeners
		this.$store.rootElement.addEventListener('keydown', this.onKeydown);
		this.$store.rootElement.addEventListener('keypress', this.onKeypress);
	},
	beforeUnmount() {
		if (this.viewer) {
			this.viewer.destroy();
		}

		this.$store.rootElement.removeEventListener('keydown', this.onKeydown);
		this.$store.rootElement.removeEventListener('keypress', this.onKeypress);
	},
	methods: {
		initViewer(reset) {
			// TODO: All tile sources could be added at once (sequence mode), but
			// this required the correct resolution to be present in the manifest,
			// which is currently loaded from the info file since the former is
			// unreliable.
			const sources = [];
			let initialSize = 0;
			let totalSize = 0;

			const pages = this.$store.isReversed
				? this.$store.options.pages.toReversed()
				: this.$store.options.pages;

			pages.filter((page) => page > 0).forEach((page, pageIndex) => {
				const pageTileSources = this.tileSources.filter(
					(tileSource) => tileSource.$meta.page === page
						&& tileSource.$meta.layerIndex === (this.$store.options.layers[pageIndex] || 0),
				);

				pageTileSources.forEach((tileSource, index) => {
					initialSize = initialSize || tileSource[this.$store.isVertical ? 'height' : 'width'];

					const size = tileSource[this.$store.isVertical ? 'height' : 'width'] / initialSize;

					if ((this.$store.options.pages[0] === 0)
						&& ((!this.$store.isReversed && page === 1)
							|| (this.$store.isReversed && page === this.$store.pageCount)
						)
					) {
						// Insert placeholder verso page
						sources.push({
							opacity: 0,
							tileSource,
							[this.$store.isVertical ? 'y' : 'x']: 0,
							[this.$store.isVertical ? 'height' : 'width']: size,
						});

						totalSize += 1 + gapBetweenPages;
					}

					const source = {
						tileSource,
						[this.$store.isVertical ? 'y' : 'x']: totalSize,
						[this.$store.isVertical ? 'height' : 'width']: size,
					};

					// TODO: This should never not be set, but in some rare
					// cases index is out of bounds, throwing an error here.
					// Need to investigate further, jury-rigged for now.
					const { target } = this.$store.manifest.items[page - 1].items[0]?.items[index] || {};
					const coords = parseCoordinatesString(target?.id || target || '');
					if (coords?.length === 4) {
						[source.x, source.y, source.width] = coords.map((number) => number / initialSize);
					} else {
						totalSize += size + gapBetweenPages;
					}

					if ((this.$store.options.pages[0] === 0)
						&& ((!this.$store.isReversed && page === this.$store.pageCount)
							|| (this.$store.isReversed && page === 1)
						)
					) {
						// Insert placeholder recto page
						sources.push({
							opacity: 0,
							tileSource,
							[this.$store.isVertical ? 'y' : 'x']: totalSize,
							[this.$store.isVertical ? 'height' : 'width']: size,
						});
					}

					sources.push(source);
				});
			});

			if (this.viewer) {
				this.viewer.addOnceHandler('open', () => {
					if (this.viewerState.isReset || reset) {
						this.resetImage();
					} else {
						this.viewer.viewport.applyConstraints(true);

						if (!this.$store.options.optionsResetOnPageChange) {
							return;
						}

						// TODO: Add an e2e test for this
						this.$store.options.optionsResetOnPageChange.forEach((option) => {
							if (option === 'filters') {
								this.resetFilters();
							} else if (option === 'pan') {
								// Move upper left corner into viewport if required
								const bounds = this.viewer.viewport.getBounds();
								if (bounds.x <= 0 && bounds.y <= 0) {
									return;
								}

								const offsetX = pages[0] ? 0 : 1;
								this.viewer.viewport.panTo({
									x: bounds.x > 0
										? (bounds.width / 2) + offsetX
										: this.$store.options.pan.x,
									y: bounds.y > 0
										? bounds.height / 2
										: this.$store.options.pan.y,
								});

								this.$store.updateOptions({ pan: {} });
							} else if (option === 'rotation') {
								this.viewer.viewport.setRotation(0);
								this.$store.updateOptions({ rotation: null });
							} else if (option === 'zoom') {
								this.viewer.viewport.goHome();
								this.$store.updateOptions({ zoom: null });
							}
						});
					}
				});

				this.viewer.open(sources);

				return;
			}

			// https://openseadragon.github.io/examples/tilesource-iiif/
			this.viewer = OpenSeadragon({
				animationTime: 0.4,
				drawer: 'canvas',
				element: this.$refs.image,
				immediateRender: this.$store.isContainerWidthAtLeast('small'),
				placeholderFillStyle: 'grey',
				preserveImageSizeOnResize: true,
				preserveViewport: true,
				showNavigationControl: false,
				showZoomControl: false,
				tileSources: sources,
				visibilityRatio: 0.2,
				...this.$store.options.viewer,
			});

			// Disable OpenSeadragons built-in key handlers which interfere with TIFY's keyboard shortcuts
			this.viewer.addHandler('canvas-key', (event) => {
				if ([
					'f', // flip horizontally
					'F', // flip horizontally
					'r', // rotate clockwise
					'R', // rotate counter-clockwise
					'S', // zoom in
					'W', // zoom out
					'+', // zoom in
					'=', // zoom in
					'-', // zoom out
					'_', // zoom out
				].includes(event.originalEvent?.key)) {
					// eslint-disable-next-line no-param-reassign
					event.preventDefaultAction = true;
				}
			});

			this.viewer.gestureSettingsMouse.clickToZoom = false;

			this.viewer.addHandler('animation-finish', () => {
				if (this.viewerState.isReset) {
					this.removeImageOptions();
					return;
				}

				const center = this.viewer.viewport.getCenter();
				this.$store.updateOptions({
					// 3 decimals are sufficient, keeping URL short
					pan: {
						x: Math.round(center.x * 1e3) / 1e3,
						y: Math.round(center.y * 1e3) / 1e3,
					},
					zoom: Math.round(this.viewer.viewport.getZoom() * 1e3) / 1e3,
				});
			});

			this.viewer.addHandler('open', () => {
				this.startLoadingWatch();

				if (this.$store.options.pan.x !== undefined
					|| this.$store.options.pan.y !== undefined
					|| this.$store.options.zoom
				) {
					if (this.$store.options.pan.x !== undefined || this.$store.options.pan.y !== undefined) {
						this.viewer.viewport.panTo({
							x: this.$store.options.pan.x,
							y: this.$store.options.pan.y,
						}, true);
					}

					if (this.$store.options.zoom) {
						this.viewer.viewport.zoomTo(this.$store.options.zoom, null, true);
					}
				} else {
					this.viewer.viewport.goHome();
				}

				if (this.$store.options.rotation !== null) {
					this.viewer.viewport.setRotation(this.$store.options.rotation);
				}

				this.updateOverlays();
			});

			this.viewer.addHandler('pan', this.updateViewerState);
			this.viewer.addHandler('resize', () => {
				if (this.viewerState.isReset) {
					this.$nextTick(() => this.viewer.viewport.goHome(true));
				}

				this.updateViewerState();
			});
			this.viewer.addHandler('rotate', this.updateViewerState);
			this.viewer.addHandler('zoom', this.updateViewerState);

			this.viewer.addHandler('tile-load-failed', (error) => {
				this.$store.addError(`Error loading image: ${error.message}`);
			});

			this.defaultCanvasCss = this.viewer.drawer.canvas.style.cssText;
			this.updateFilterStyle();

			this.$api.expose(this.resetImage);
			this.$api.expose(this.viewer, 'viewer');

			this.promise.resolve();
		},
		loadInfo(reset = false) {
			this.stopLoadingWatch();

			this.avResource = null;

			let imageResource;
			let avResource;

			const infoPromises = [];

			this.$store.options.pages.filter((page) => page > 0).forEach((page, pageIndex) => {
				const pageItem = this.$store.manifest.items[page - 1];
				const layerIndex = this.$store.options.layers[pageIndex] || 0;

				pageItem.items?.[0]?.items?.forEach((item, itemIndex) => {
					const resource = item.body?.items?.[layerIndex] || item.body;

					if (!resource) {
						this.$store.addError(`Resource missing for page ${page}`);
						return;
					}

					if (['Sound', 'Video'].includes(resource?.type)) {
						// Reset to single-page view; page change re-triggers loadInfo
						if (this.$store.options.pages[1] > -1) {
							this.$store.updateOptions({ pages: [page] });
							return;
						}

						// Force re-render because replacing just the <source> while a
						// video is playing does have no effect
						this.avResource = {};
						avResource = {
							format: resource.format,
							type: resource.type,
							url: resource.id,
						};
						this.$nextTick(() => {
							this.avResource = avResource;
						});

						// TODO: Add support for selecting from multiple accompanyingCanvas
						const canvas = pageItem.accompanyingCanvas || pageItem.placeholderCanvas;
						const accompanyingBody = canvas?.items?.[0]?.items?.[0]?.body;
						imageResource = accompanyingBody?.items?.[layerIndex] || accompanyingBody;
					} else {
						imageResource = resource;
					}

					if (imageResource && this.tileSources.find(
						(tileSource) => tileSource.$meta.page === page
							&& tileSource.$meta.itemIndex === itemIndex
							&& tileSource.$meta.layerIndex === layerIndex,
					)) {
						return;
					}

					const services = imageResource?.source?.service || imageResource?.service;
					if (services) {
						const service = [].concat(services)[0];
						const id = service.id || service['@id'];
						const infoUrl = `${id}${id.at(-1) === '/' ? '' : '/'}info.json`;
						infoPromises.push(
							this.$store.fetchJson(infoUrl).then(
								(infoItem) => ({
									...infoItem,
									$meta: {
										page,
										itemIndex,
										layerIndex,
									},
								}),
								(error) => {
									let status;
									if (error.response && error.response.statusText) {
										status = error.response.statusText;
									} else if (error.message) {
										status = error.message;
									}

									this.$store.addError(`Error loading info file for page ${page}${status ? `: ${status}` : ''}`);
								},
							),
						);
					} else if (imageResource?.id) {
						this.tileSources.push({
							$meta: { page, itemIndex, layerIndex },
							type: 'image',
							url: imageResource.id,
							width: imageResource.width,
							height: imageResource.height,
						});
					}
				});

				if (!imageResource && !avResource) {
					this.$store.addError(`Image missing for page ${page}`);
				}
			});

			if (infoPromises.length) {
				Promise.all(infoPromises).then((infoItems) => {
					infoItems.filter(Boolean).forEach((infoItem) => {
						if (this.$store.options.preferredImageFormat) {
							const formats = infoItem.extraFormats || infoItem.profile?.[1]?.formats;
							if (formats?.includes(this.$store.options.preferredImageFormat)) {
								// eslint-disable-next-line no-param-reassign
								infoItem.tileFormat = this.$store.options.preferredImageFormat;
							}
						}

						this.tileSources.push(infoItem);
					});

					// Only re-init the viewer if the resolved promises correspond to
					// the currently displayed pages. When quickly flipping through
					// pages or on slow connections, promises could resolve when the
					// corresponding pages are no longer displayed.
					const pages = this.$store.options.pages.filter((page) => page > 0);
					if (pages.every((page, index) => infoItems[index]?.$meta.page === page)) {
						this.initViewer(reset);
					}
				});
			} else if (imageResource) {
				this.initViewer(reset);
			}
		},
		onKeydown(event) {
			if (event.key === 'Escape') {
				this.$store.rootElement.focus();
			}

			// Reset pan, zoom, rotation and filters
			const zeroKeyCodes = [
				45, // Insert (Shift+Numpad0)
				48, // 0
				96, // Numpad0
			];

			if (zeroKeyCodes.includes(event.keyCode)) {
				if (event.shiftKey) {
					this.resetImage(event);
				} else {
					this.viewer.viewport.goHome();
				}
			}
		},
		onKeypress(event) {
			if (preventEvent(event)) {
				return;
			}

			switch (event.key) {
				case 'I':
					this.resetFilters();
					break;
				case 'r':
				case 'R':
					this.rotateRight(event);
					break;

				// Restore zoom keyboard events, but with custom zoom factor
				case '+':
				case '=':
				case 'W':
					this.zoomIn();
					break;
				case '-':
				case '_':
				case 'S':
					this.zoomOut();
					break;
				default:
			}
		},
		removeImageOptions() {
			this.$store.updateOptions({
				pan: {},
				zoom: null,
			});
		},
		resetFilters() {
			this.viewer.drawer.canvas.style.cssText = this.defaultCanvasCss;
			this.$store.updateOptions({ filters: {} });
		},
		resetImage(includingFiltersAndRotation) {
			if (includingFiltersAndRotation) {
				// Rotation has to be reset before pan and zoom
				this.viewer.viewport.setRotation(0);
				this.$store.updateOptions({ rotation: null });
				if (this.filtersActive) {
					this.resetFilters();
				}
			}

			this.viewer.viewport.goHome();
			this.removeImageOptions();
		},
		rotateRight(event) {
			const { viewport } = this.viewer;
			const degrees = event && event.shiftKey
				? 0
				: (viewport.getRotation() + 90) % 360;
			viewport.setRotation(degrees);
			this.$store.updateOptions({ rotation: degrees || null });
		},
		setFilter(name, event) {
			const value = event.target.valueAsNumber;
			if (value === 1) {
				delete this.$store.options.filters[name];
			} else {
				this.$store.options.filters[name] = value;
			}
			this.$store.updateOptions({ filters: this.$store.options.filters });
			this.updateFilterStyle();
		},
		startLoadingWatch() {
			this.$store.loading = 0;
			for (let i = this.viewer.world.getItemCount() - 1; i >= 0; i -= 1) {
				const image = this.viewer.world.getItemAt(i);
				// eslint-disable-next-line no-underscore-dangle
				if (image && image._tilesLoading) {
					this.$store.loading = 1;
					break;
				}
			}

			// TODO: A timeout instead of a proper event handler? Abomination!
			// That's because neither getFullyLoaded() nor the fully-loaded-change
			// event are working for images that are not currently within canvas
			// bounds. OpenSeadragon would need add a global fully-loaded event,
			// not just one for each TiledImage.
			this.loadingTimeout = setTimeout(this.startLoadingWatch, 200);
		},
		stopLoadingWatch() {
			clearTimeout(this.loadingTimeout);
		},
		toggleOverlays() {
			this.$store.updateOptions({
				annotationsVisible: this.$store.options.annotationsVisible !== false ? false : null,
			});
		},
		updateFilterStyle() {
			if (!this.filtersActive) {
				return;
			}

			const filters = [];
			Object.keys(this.$store.options.filters).forEach((key) => {
				filters.push(`${key}(${this.$store.options.filters[key]})`);
			});

			const filterString = filters.join(' ');

			this.viewer.drawer.canvas.style.cssText = `${this.defaultCanvasCss} filter: ${filterString}`;
		},
		updateOverlays() {
			if (!this.viewer
				|| !this.$store.options.pages
					.filter((page) => page > 0)
					.every((page) => this.tileSources.some((tileSource) => tileSource.$meta.page === page))
			) {
				return;
			}

			this.viewer.clearOverlays();
			this.overlayElements = [];

			if (!this.$store.annotationsActive) {
				return;
			}

			let firstVisibleCanvasSize;
			let offset = 0;

			this.$store.options.pages.filter((page) => page > -1).forEach((page, pageIndex) => {
				const firstVisibleCanvas = this.tileSources.find(
					(tileSource) => tileSource.$meta.page === (page === 0 ? 1 : page)
						&& tileSource.$meta.layerIndex === (this.$store.options.layers[pageIndex] || 0),
				);

				// Calculate offset for each page, which depends on all previously displayed pages
				if (pageIndex === 0) {
					firstVisibleCanvasSize = firstVisibleCanvas[this.$store.isVertical ? 'height' : 'width'];

					if (page === 0) {
						return;
					}
				} else {
					const prevPage = this.$store.options.pages[pageIndex - 1];
					const prevCanvasSize = this.$store.manifest.items[prevPage - 1]?.[this.$store.isVertical ? 'height' : 'width']
						|| firstVisibleCanvasSize;
					offset += (gapBetweenPages + prevCanvasSize / firstVisibleCanvasSize) * (this.$store.isReversed ? -1 : 1);
				}

				if (!this.$store.annotations[page]?.[0]?.coords) {
					return;
				}

				this.$store.annotations[page]?.forEach((annotation, annotationIndex) => {
					const button = document.createElement('button');
					button.ariaLabel = `${page}/${annotationIndex}`;
					button.className = `tify-media-overlay${
						this.$store.options.annotationId === annotation.id
							? ' -current'
							: ''
					}`;
					button.id = annotation.id;
					button.type = 'button';

					// eslint-disable-next-line no-new
					new OpenSeadragon.MouseTracker({
						element: button,
						clickHandler: (event) => {
							if (!event.quick) {
								// Click triggered by drag-end
								return;
							}

							// TODO: Canvas touch event triggers click on newly opened
							// view on small containers. Using timeout as a workaround.
							setTimeout(() => this.$store.toggleAnnotationId(annotation.id), 5);
						},
						keyDownHandler: (key) => key.keyCode === 13 && this.$store.toggleAnnotationId(annotation.id),
					});

					this.viewer.addOverlay({
						element: button,
						location: new OpenSeadragon.Rect(
							annotation.coords[0] / firstVisibleCanvasSize + (this.$store.isVertical ? 0 : offset),
							annotation.coords[1] / firstVisibleCanvasSize + (this.$store.isVertical ? offset : 0),
							annotation.coords[2] / firstVisibleCanvasSize,
							annotation.coords[3] / firstVisibleCanvasSize,
						),
					});

					this.overlayElements.push(button);
				});
			});
		},
		// NOTE: With Vue 3, watching return values of OpenSeadragon function via
		// `computed` is no longer working, so we need to actively keep track of
		// its state
		updateViewerState() {
			const zoom = this.viewer.viewport.getZoom();
			this.viewerState.isMaxZoom = zoom >= this.viewer.viewport.getMaxZoom();
			this.viewerState.isMinZoom = zoom <= this.viewer.viewport.getMinZoom();

			const homeBounds = this.viewer.viewport.getHomeBounds();
			const currentBounds = this.viewer.viewport.getBounds();
			this.viewerState.isReset = Math.abs(homeBounds.height - currentBounds.height) < 1e-9
				&& Math.abs(homeBounds.width - currentBounds.width) < 1e-9
				&& Math.abs(homeBounds.x - currentBounds.x) < 1e-9
				&& Math.abs(homeBounds.y - currentBounds.y) < 1e-9;
		},
		zoomIn() {
			this.viewer.viewport.zoomBy(zoomFactor);
			this.viewer.viewport.applyConstraints();
		},
		zoomOut() {
			this.viewer.viewport.zoomBy(1 / zoomFactor);
			this.viewer.viewport.applyConstraints();
		},
	},
};
</script>

<template>
	<section
		class="tify-media"
		aria-live="polite"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Media') }}
		</h2>

		<div
			ref="image"
			class="tify-media-image"
			:class="{ '-annotations-hidden': $store.options.annotationsVisible === false }"
		/>

		<div
			v-if="viewer"
			class="tify-media-buttons -controls"
		>
			<button
				type="button"
				class="tify-media-button"
				:disabled="viewerState.isMaxZoom"
				:title="$translate('Zoom in')"
				:aria-label="$translate('Zoom in')"
				@click="zoomIn()"
			>
				<IconPlus />
			</button>
			<button
				type="button"
				class="tify-media-button"
				:disabled="viewerState.isMinZoom"
				:title="$translate('Zoom out')"
				:aria-label="$translate('Zoom out')"
				@click="zoomOut()"
			>
				<IconMinus />
			</button>
			<button
				type="button"
				class="tify-media-button"
				:disabled="viewerState.isReset"
				:title="$translate('Reset')"
				:aria-label="$translate('Reset')"
				@click="resetImage(!!$event.shiftKey)"
			>
				<IconAspectRatio />
			</button>

			<button
				type="button"
				class="tify-media-button"
				:class="{ '-active': !!$store.options.rotation }"
				:title="$translate('Rotate')"
				:aria-label="$translate('Rotate')"
				@click="rotateRight($event)"
			>
				<IconRotateRight />
			</button>

			<AppDropdown
				class="tify-media-dropdown -filters"
				:class="{ '-active': filtersActive }"
				alignment="center"
				position="right"
				:label="$translate('Toggle image filters')"
				shortcut="i"
			>
				<template #button>
					<IconTune />
				</template>

				<h3 class="tify-sr-only">
					{{ $translate('Image filters') }}
				</h3>

				<MediaFilters @update="(type, value) => setFilter(type, value)" />

				<p>
					<button
						type="button"
						class="tify-media-reset"
						:disabled="!filtersActive"
						@click.stop="resetFilters()"
					>
						<IconBackupRestore />
						{{ $translate('Reset') }}
					</button>
				</p>
			</AppDropdown>

			<button
				v-if="$store.annotations.length
					&& ($store.options.view === 'text' || !$store.isContainerWidthAtLeast('medium'))
				"
				type="button"
				class="tify-media-button"
				:title="$translate('Toggle annotations')"
				:aria-label="$translate('Toggle annotations')"
				@click="toggleOverlays()"
			>
				<IconCommentTextOutline v-if="$store.options.annotationsVisible !== false" />
				<IconCommentOffOutline v-else />
			</button>

			<AppDropdown
				v-if="multiLayerResources.length"
				class="tify-media-dropdown -layers"
				:class="{ '-active': $store.options.layers.some(Boolean) }"
				alignment="center"
				position="right"
				:label="$translate('Toggle image layer select')"
				shortcut="c"
			>
				<template #button>
					<IconLayersOutline />
				</template>

				<h3 class="tify-sr-only">
					{{ $translate('Layer') }}
				</h3>
				<template
					v-for="resource in multiLayerResources"
					:key="resource.pageIndex"
				>
					<h4 v-if="$store.options.pages.filter(page => page > 0).length > 1">
						<PageName
							:number="$store.options.pages[resource.pageIndex]"
							:wrap="true"
						/>
					</h4>
					<ol class="tify-button-list">
						<li
							v-for="(layer, layerIndex) in resource.items"
							:key="layer.id"
						>
							<button
								type="button"
								:aria-pressed="layerIndex === ($store.options.layers[resource.pageIndex] || 0)"
								@click="$store.options.layers[resource.pageIndex] = layerIndex; loadInfo()"
							>
								{{ $store.localize(layer.label) }}
							</button>
						</li>
					</ol>
				</template>
			</AppDropdown>
		</div>

		<div class="tify-media-buttons -pagination">
			<button
				v-for="button in paginationButtons"
				:key="button.position"
				type="button"
				class="tify-media-button"
				:class="`-${button.position}`"
				:title="button.title"
				:aria-label="button.title"
				@click="button.onClick"
			>
				<!-- NOTE: Avoiding <component :is="…" /> in favor of unplugin-vue-components -->
				<IconChevronLeft v-if="button.position === 'left'" />
				<IconChevronRight v-else-if="button.position === 'right'" />
				<IconChevronUp v-else-if="button.position === 'top'" />
				<IconChevronDown v-else-if="button.position === 'bottom'" />
			</button>
		</div>

		<AppPlayer
			v-if="avResource?.url"
			:src="avResource.url"
			:format="avResource.format"
			:hasImage="!!viewer"
		/>
	</section>
</template>
