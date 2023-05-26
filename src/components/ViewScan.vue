<template>
	<section class="tify-scan">
		<h2 class="tify-sr-only">
			{{ translate('Scan') }}
		</h2>

		<button
			v-if="!customPageViewActive && !isFirstPage"
			type="button"
			class="tify-scan-page-button -previous"
			:title="translate('Previous page')"
			@click="goToPreviousPage"
		>
			<icon-chevron-left />
		</button>
		<button
			v-if="!customPageViewActive && !isLastPage"
			type="button"
			class="tify-scan-page-button -next"
			:title="translate('Next page')"
			@click="goToNextPage"
		>
			<icon-chevron-right />
		</button>

		<div
			v-if="viewer"
			class="tify-scan-buttons"
		>
			<button
				type="button"
				class="tify-scan-button"
				:disabled="viewerState.isMaxZoom"
				:title="translate('Zoom in')"
				@click="zoomIn"
			>
				<icon-magnify-plus />
			</button>
			<button
				type="button"
				class="tify-scan-button"
				:disabled="viewerState.isReset"
				:title="translate('Reset')"
				@click="resetScan(!!$event.shiftKey)"
			>
				<icon-aspect-ratio />
			</button>
			<button
				type="button"
				class="tify-scan-button"
				:disabled="viewerState.isMinZoom"
				:title="translate('Zoom out')"
				@click="zoomOut"
			>
				<icon-magnify-minus />
			</button>

			<button
				type="button"
				class="tify-scan-button"
				:class="{ '-active': options.rotation }"
				:title="translate('Rotate')"
				@click="rotateRight($event)"
			>
				<icon-rotate-right />
			</button>

			<div
				v-click-outside="closeFilters"
				class="tify-scan-filters"
				:class="{ '-open': filtersVisible }"
			>
				<button
					type="button"
					class="tify-scan-button"
					:class="{ '-active': filtersActive }"
					:title="translate('Toggle image filters')"
					:aria-controls="getId('filters')"
					:aria-expanded="filtersVisible ? 'true' : 'false'"
					@click="filtersVisible = !filtersVisible"
				>
					<icon-tune />
				</button>
				<div
					v-show="filtersVisible"
					:id="getId('filters')"
					class="tify-scan-filters-popup"
				>
					<h3 class="tify-sr-only">
						{{ translate('Image filters') }}
					</h3>
					<p>
						<label>
							<icon-white-balance-sunny />
							{{ translate('Brightness') }}
							<b>{{ Math.round((options.filters.brightness || 1) * 100) }}&nbsp;%</b>
							<input
								ref="firstSlider"
								class="tify-scan-range"
								max="2"
								min=".5"
								step=".01"
								type="range"
								:value="options.filters.brightness || 1"
								@input="setFilter('brightness', $event)"
							/>
						</label>
					</p>
					<p>
						<label>
							<icon-brightness-6 />
							{{ translate('Contrast') }}
							<b>{{ Math.round((options.filters.contrast || 1) * 100) }}&nbsp;%</b>
							<input
								class="tify-scan-range"
								max="2"
								min=".5"
								step=".01"
								type="range"
								:value="options.filters.contrast || 1"
								@input="setFilter('contrast', $event)"
							/>
						</label>
					</p>
					<p>
						<label>
							<icon-palette />
							{{ translate('Saturation') }}
							<b>{{ Math.round(saturation * 100) }}&nbsp;%</b>
							<input
								class="tify-scan-range"
								max="3"
								min="0"
								step=".01"
								type="range"
								:value="saturation"
								@input="setFilter('saturate', $event)"
							/>
						</label>
					</p>
					<p>
						<button
							type="button"
							class="tify-scan-reset"
							:disabled="!filtersActive"
							@click="resetFilters"
						>
							<icon-backup-restore />
							{{ translate('Reset') }}
						</button>
					</p>
				</div>
			</div>
		</div>

		<div
			ref="image"
			class="tify-scan-image"
		/>
	</section>
</template>

<script>
import OpenSeadragon from 'openseadragon';

import { expose } from '../modules/api';
import { errorHandler } from '../modules/errorHandler';
import { getId } from '../modules/id';
import { fetchJson, loading } from '../modules/http';
import { translate } from '../modules/i18n';
import { preventEvent } from '../modules/keyboard';
import { isLastPage, customPageViewActive, isFirstPage, goToPreviousPage, goToNextPage } from '../modules/pagination';
import { isMobile } from '../modules/ui';
import { canvases, options, pageCount, updateOptions } from '../modules/store';

const gapBetweenPages = 0.01;

export default {
	data() {
		return {
			filtersVisible: false,
			loadingTimeout: null,
			options,
			tileSources: {},
			viewer: null,
			viewerState: {}, // NOTE: See updateViewerState()
			zoomFactor: 1.5,
			isLastPage,
			customPageViewActive,
			isFirstPage,
		};
	},
	computed: {
		filtersActive() {
			return Object.keys(options.filters).length > 0;
		},
		saturation() {
			const saturation = options.filters.saturate;
			return typeof saturation === 'number' ? saturation : 1;
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'options.pages': function (newValue, oldValue) {
			const reset = newValue.length !== oldValue.length;
			this.loadImageInfo(reset);
		},
	},
	mounted() {
		this.loadImageInfo();
		this.updateFilterStyle();

		options.root.$el.addEventListener('keydown', this.onKeydown);
		options.root.$el.addEventListener('keypress', this.onKeypress);
	},
	beforeUnmount() {
		if (this.viewer) {
			this.viewer.destroy();
		}

		options.root.$el.removeEventListener('keydown', this.onKeydown);
		options.root.$el.removeEventListener('keypress', this.onKeypress);
	},
	methods: {
		closeFilters() {
			this.filtersVisible = false;
		},
		getId,
		goToNextPage,
		goToPreviousPage,
		initViewer(reset) {
			// TODO: All tile sources could be added at once (sequence mode), but
			// this required the correct resolution to be present in the manifest,
			// which is currently loaded from the info file since the former is
			// unreliable.
			const tileSources = [];
			let initialWidth = 0;
			let tileSourceIndex;
			let totalWidth = 0;

			options.pages.forEach((page, index) => {
				let opacity = 1;
				if (page < 1) {
					opacity = 0;
					tileSourceIndex = index > 0 ? pageCount.value : 1;
				} else {
					tileSourceIndex = page;
				}

				const tileSource = this.tileSources[tileSourceIndex];

				if (!tileSource) {
					return;
				}

				if (!initialWidth) {
					initialWidth = tileSource.width;
				}

				const width = tileSource.width / initialWidth;

				tileSources.push({
					opacity,
					tileSource,
					width,
					x: totalWidth,
				});

				totalWidth += width + gapBetweenPages;
			});

			if (this.viewer) {
				this.viewer.addOnceHandler('open', () => {
					if (this.viewerState.isReset || reset) {
						this.resetScan();
					} else {
						this.viewer.viewport.applyConstraints(true);

						if (!options.optionsResetOnPageChange) {
							return;
						}

						// TODO: Add an e2e test for this
						options.optionsResetOnPageChange.forEach((option) => {
							if (option === 'filters') {
								this.resetFilters();
							} else if (option === 'pan') {
								// Move upper left corner into viewport if required
								const bounds = this.viewer.viewport.getBounds();
								if (bounds.x <= 0 && bounds.y <= 0) {
									return;
								}

								const offsetX = options.pages[0]
									? 0
									: 1;
								this.viewer.viewport.panTo({
									x: bounds.x > 0
										? (bounds.width / 2) + offsetX
										: options.pan.x,
									y: bounds.y > 0
										? bounds.height / 2
										: options.pan.y,
								});

								updateOptions({ pan: {} });
							} else if (option === 'rotation') {
								this.viewer.viewport.setRotation(0);
								updateOptions({ rotation: null });
							} else if (option === 'zoom') {
								this.viewer.viewport.goHome();
								updateOptions({ zoom: null });
							}
						});
					}
				});

				this.viewer.open(tileSources);
				return;
			}

			// https://openseadragon.github.io/examples/tilesource-iiif/
			this.viewer = OpenSeadragon({
				animationTime: 0.4,
				element: this.$refs.image,
				immediateRender: true,
				preload: !isMobile(),
				preserveImageSizeOnResize: true,
				preserveViewport: true,
				showNavigationControl: false,
				showZoomControl: false,
				tileSources,
				visibilityRatio: 0.2,
				...options.viewer,
			});

			// Disable OpenSeadragons built-in key handler which interferes with TIFY's keyboard shortcuts
			this.viewer.innerTracker.keyHandler = null;

			this.viewer.gestureSettingsMouse.clickToZoom = false;

			this.viewer.addHandler('animation-finish', () => {
				if (this.viewerState.isReset) {
					this.removeScanOptions();
					return;
				}

				const center = this.viewer.viewport.getCenter();
				updateOptions({
					// 3 decimals are sufficient, keeping URL short
					pan: {
						x: Math.round(center.x * 1e3) / 1e3,
						y: Math.round(center.y * 1e3) / 1e3,
					},
					zoom: Math.round(this.viewer.viewport.getZoom() * 1e3) / 1e3,
				});
			});

			// Required for touchscreens: The canvas swallows the touch event, so click-outside is not triggered
			this.viewer.addHandler('canvas-click', () => {
				document.body.click();
			});

			this.viewer.addHandler('open', () => {
				this.startLoadingWatch();

				if (options.pan.x !== undefined || options.pan.y !== undefined || options.zoom) {
					if (options.pan.x !== undefined || options.pan.y !== undefined) {
						this.viewer.viewport.panTo({
							x: options.pan.x,
							y: options.pan.y,
						}, true);
					}

					if (options.zoom) {
						this.viewer.viewport.zoomTo(options.zoom, null, true);
					}
				} else {
					this.viewer.viewport.goHome();
				}

				if (options.rotation !== null) {
					this.viewer.viewport.setRotation(options.rotation);
				}
			});

			this.viewer.addHandler('pan', this.updateViewerState);
			this.viewer.addHandler('resize', this.updateViewerState);
			this.viewer.addHandler('zoom', this.updateViewerState);

			this.viewer.addHandler('tile-load-failed', (error) => {
				errorHandler.add(`Error loading image: ${error.message}`);
			});

			expose(this.resetScan);
			expose(this.viewer, 'viewer');
		},
		loadImageInfo(reset = false) {
			this.stopLoadingWatch();

			const infoPromises = [];
			options.pages.forEach((page) => {
				if (page < 1 || this.tileSources[page]) {
					return;
				}

				const { resource } = canvases.value[page - 1].images[0];
				if (resource.service) {
					const id = resource.service['@id'];
					const infoUrl = `${id}${id.slice(-1) === '/' ? '' : '/'}info.json`;
					infoPromises.push(
						fetchJson(infoUrl).then(
							(infoItem) => ({ ...infoItem, page }),
							(error) => {
								let status;
								if (error.response && error.response.statusText) {
									status = error.response.statusText;
								} else if (error.message) {
									status = error.message;
								}

								errorHandler.add(`Error loading info file for page ${page}${status ? `: ${status}` : ''}`);
							},
						),
					);
				} else {
					this.tileSources[page] = {
						type: 'image',
						url: resource['@id'],
						width: resource.width,
						height: resource.height,
					};
				}
			});

			if (infoPromises.length) {
				Promise.all(infoPromises).then((infoItems) => {
					infoItems.forEach((infoItem) => {
						if (infoItem) {
							this.tileSources[infoItem.page] = infoItem;
						}
					});

					this.initViewer(reset);
				});
			} else {
				this.initViewer(reset);
			}
		},
		onKeydown(event) {
			if (event.key === 'Escape') {
				this.filtersVisible = false;
			}

			// Reset pan, zoom, rotation and filters
			const zeroKeyCodes = [
				45, // Insert (Shift+Numpad0)
				48, // 0
				96, // Numpad0
			];

			if (zeroKeyCodes.indexOf(event.keyCode) > -1) {
				if (event.shiftKey) {
					this.resetScan(event);
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
				case 'r':
				case 'R':
				// NOTE: Same physical key for QUERTY and QUERTZ keyboards
					this.rotateRight(event);
					break;
				case 'i':
					this.filtersVisible = !this.filtersVisible;
					if (this.filtersVisible) {
						this.$nextTick(() => {
							this.$refs.firstSlider.focus();
						});
					}
					break;
				case 'I':
					this.resetFilters();
					break;

				// Restore some keyboard events for OpenSeadragon
				// https://github.com/openseadragon/openseadragon/blob/master/src/viewer.js#L2680-L2725
				case '+':
				case '=':
				case 'W':
					this.viewer.viewport.zoomBy(1.1);
					this.viewer.viewport.applyConstraints();
					break;
				case '-':
				case '_':
				case 'S':
					this.viewer.viewport.zoomBy(0.9);
					this.viewer.viewport.applyConstraints();
					break;
				case 'w':
					this.viewer.innerTracker.keyDownHandler({ keyCode: 38 }); // up arrow
					break;
				case 's':
					this.viewer.innerTracker.keyDownHandler({ keyCode: 40 }); // down arrow
					break;
				case 'a':
					this.viewer.innerTracker.keyDownHandler({ keyCode: 37 }); // down arrow
					break;
				case 'd':
					this.viewer.innerTracker.keyDownHandler({ keyCode: 39 }); // right arrow
					break;
				default:
			}
		},
		removeScanOptions() {
			updateOptions({
				pan: {},
				zoom: null,
			});
		},
		resetFilters() {
			this.$refs.image.style.cssText = '';
			updateOptions({ filters: {} });
		},
		resetScan(includingFiltersAndRotation) {
			if (includingFiltersAndRotation) {
				// Rotation has to be reset before pan and zoom
				this.viewer.viewport.setRotation(0);
				updateOptions({ rotation: null });
				if (this.filtersActive) {
					this.resetFilters();
				}
			}

			this.viewer.viewport.goHome();
			this.removeScanOptions();
		},
		rotateRight(event) {
			const { viewport } = this.viewer;
			const degrees = event && event.shiftKey
				? 0
				: (viewport.getRotation() + 90) % 360;
			viewport.setRotation(degrees);
			updateOptions({ rotation: degrees || null });
		},
		setFilter(name, event) {
			const value = event.target.valueAsNumber;
			if (value === 1) {
				delete options.filters[name];
			} else {
				options.filters[name] = value;
			}
			updateOptions({ filters: options.filters });
			this.updateFilterStyle();
		},
		startLoadingWatch() {
			loading.value = 0;
			for (let i = this.viewer.world.getItemCount() - 1; i >= 0; i -= 1) {
				const image = this.viewer.world.getItemAt(i);
				// eslint-disable-next-line no-underscore-dangle
				if (image && image._tilesLoading) {
					loading.value = 1;
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
		updateFilterStyle() {
			if (!this.filtersActive) {
				return;
			}

			const filters = [];
			Object.keys(options.filters).forEach((key) => {
				filters.push(`${key}(${options.filters[key]})`);
			});

			const { image } = this.$refs;
			const filterString = filters.join(' ');

			image.style.cssText = `filter: ${filterString}`;
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
		translate,
		zoomIn() {
			this.viewer.viewport.zoomBy(this.zoomFactor);
		},
		zoomOut() {
			this.viewer.viewport.zoomBy(1 / this.zoomFactor);
		},
	},
};
</script>
