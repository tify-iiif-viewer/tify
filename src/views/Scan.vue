<template>
	<section class="tify-scan">
		<h2 class="tify-sr-only">{{ $root.translate('Scan') }}</h2>

		<button
			v-if="!customPageViewActive && !isFirstPage"
			class="tify-scan_page-button -previous"
			:title="$root.translate('Previous page')"
			@click="goToPreviousPage"
		>
			<icon-chevron-left decorative/>
			<span class="tify-sr-only">{{ $root.translate('Previous page') }}</span>
		</button>
		<button
			v-if="!customPageViewActive && !isLastPage"
			class="tify-scan_page-button -next"
			:title="$root.translate('Next page')"
			@click="goToNextPage"
		>
			<icon-chevron-right decorative/>
			<span class="tify-sr-only">{{ $root.translate('Next page') }}</span>
		</button>

		<div class="tify-scan_buttons" v-if="viewer">
			<button
				class="tify-scan_button"
				:disabled="isMaxZoom"
				:title="$root.translate('Zoom in')"
				@click="zoomIn"
			>
				<icon-magnify-plus decorative/>
				<span class="tify-sr-only">{{ $root.translate('Zoom in') }}</span>
			</button>
			<button
				class="tify-scan_button"
				:disabled="isReset"
				:title="$root.translate('Reset')"
				@click="resetViewer(!!$event.shiftKey)"
			>
				<icon-aspect-ratio decorative/>
				<span class="tify-sr-only">{{ $root.translate('Reset') }}</span>
			</button>
			<button
				class="tify-scan_button"
				:disabled="isMinZoom"
				:title="$root.translate('Zoom out')"
				@click="zoomOut"
			>
				<icon-magnify-minus decorative/>
				<span class="tify-sr-only">{{ $root.translate('Zoom out') }}</span>
			</button>

			<button
				class="tify-scan_button"
				:class="{ '-active': $root.options.rotation }"
				:title="$root.translate('Rotate')"
				@click="rotateRight($event)"
			>
				<icon-rotate-right decorative/>
				<span class="tify-sr-only">{{ $root.translate('Rotate') }}</span>
			</button>

			<div
				v-click-outside="closeFilters"
				v-if="cssFiltersSupported"
				class="tify-scan_filters"
				:class="{ '-open': filtersVisible }"
			>
				<button
					class="tify-scan_button"
					:class="{ '-active': filtersActive }"
					:title="$root.translate('Toggle image filters')"
					@click="filtersVisible = !filtersVisible"
				>
					<icon-tune decorative/>
					<span class="tify-sr-only">{{ $root.translate('Toggle image filters') }}</span>
				</button>
				<div class="tify-scan_filter-popup" v-show="filtersVisible">
					<p>
						<label for="tify-scan_brightness">
							<icon-white-balance-sunny decorative/>
							{{ $root.translate('Brightness:') }}
							{{ Math.round(($root.options.filters.brightness || 1) * 100) }}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_brightness"
							max="2"
							min=".5"
							ref="firstSlider"
							step=".01"
							type="range"
							:value="$root.options.filters.brightness || 1"
							@input="setFilter('brightness', $event)"
						>
					</p>
					<p>
						<label for="tify-scan_contrast">
							<icon-brightness-6 decorative/>
							{{ $root.translate('Contrast:') }}
							{{ Math.round(($root.options.filters.contrast || 1) * 100) }}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_contrast"
							max="2"
							min=".5"
							step=".01"
							type="range"
							:value="$root.options.filters.contrast || 1"
							@input="setFilter('contrast', $event)"
						>
					</p>
					<p>
						<label for="tify-scan_saturation">
							<icon-palette decorative/>
							{{ $root.translate('Saturation:') }}
							{{ Math.round(saturation * 100)}}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_saturation"
							max="3"
							min="0"
							step=".01"
							type="range"
							:value="saturation"
							@input="setFilter('saturate', $event)"
						>
					</p>
					<p>
						<button
							class="tify-scan_reset"
							:disabled="!filtersActive"
							@click="resetFilters"
						>
							<icon-backup-restore decorative/>
							{{ $root.translate('Reset') }}
						</button>
					</p>
				</div>
			</div>
		</div>

		<div class="tify-scan_image" ref="image"/>
	</section>
</template>

<script>
import OpenSeadragon from '@/../openseadragon/src/openseadragon';

import keyboard from '@/mixins/keyboard';
import pagination from '@/mixins/pagination';

// TODO: Is there a better way to make OpenSeadragon available to imports below?
window.OpenSeadragon = OpenSeadragon;

// Custom-build OpenSeadragon. Order is important!
require('@/../openseadragon/src/controldock');
require('@/../openseadragon/src/eventsource');

require('@/../openseadragon/src/tilesource');

require('@/../openseadragon/src/iiiftilesource');
require('@/../openseadragon/src/imagetilesource');

require('@/../openseadragon/src/drawer');
require('@/../openseadragon/src/imageloader');
require('@/../openseadragon/src/mousetracker');
require('@/../openseadragon/src/placement');
require('@/../openseadragon/src/point');
require('@/../openseadragon/src/spring');
require('@/../openseadragon/src/tile');
require('@/../openseadragon/src/tilecache');
require('@/../openseadragon/src/tiledimage');
require('@/../openseadragon/src/rectangle');
require('@/../openseadragon/src/viewer');
require('@/../openseadragon/src/viewport');
require('@/../openseadragon/src/world');

const gapBetweenPages = .01;
const vendorPrefixes = ['-webkit-', '-moz-', '-o-', '-ms-'];

export default {
	mixins: [
		keyboard,
		pagination,
	],
	data() {
		return {
			filtersVisible: false,
			loadingTimeout: null,
			tileSources: {},
			viewer: null,
			zoomFactor: 1.5,
		};
	},
	computed: {
		cssFiltersSupported() {
			// https://raw.githubusercontent.com/Modernizr/Modernizr/master/feature-detects/css/filters.js
			const el = document.createElement('a');
			el.style.cssText = vendorPrefixes.join('filter:blur(2px);');
			// https://github.com/Modernizr/Modernizr/issues/615
			// documentMode is needed for false positives in old IE, see issue above
			return !!el.style.length
					&& ((document.documentMode === undefined || document.documentMode > 9));
		},
		filtersActive() {
			return (Object.keys(this.$root.options.filters).length > 0);
		},
		isMinZoom() {
			if (!this.viewer) {
				return true;
			}

			return this.viewer.viewport.getZoom() <= this.viewer.viewport.getMinZoom();
		},
		isMaxZoom() {
			if (!this.viewer) {
				return true;
			}

			return this.viewer.viewport.getZoom() >= this.viewer.viewport.getMaxZoom();
		},
		isReset() {
			// There may be some tiny deviation from the target values
			const homeBounds = this.viewer.viewport.getHomeBounds();
			const currentBounds = this.viewer.viewport.getBounds();
			return (
				Math.abs(homeBounds.height - currentBounds.height) < 1e-9
					&& Math.abs(homeBounds.width - currentBounds.width) < 1e-9
					&& Math.abs(homeBounds.x - currentBounds.x) < 1e-9
					&& Math.abs(homeBounds.y - currentBounds.y) < 1e-9
			);
		},
		saturation() {
			const saturation = this.$parent.$parent.options.filters.saturate;
			return typeof saturation === 'number' ? saturation : 1;
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$root.options.pages': function (newValue, oldValue) {
			const resetViewer = newValue.length !== oldValue.length;
			this.loadImageInfo(resetViewer);
		},
	},
	methods: {
		closeFilters() {
			this.filtersVisible = false;
		},
		initViewer(resetViewer) {
			const { options } = this.$root;

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
					tileSourceIndex = (index > 0 ? this.$root.pageCount : 1);
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
					if (this.isReset || resetViewer) {
						this.resetViewer();
					} else {
						this.viewer.viewport.applyConstraints(true);

						// Move upper left corner into viewport if required
						const bounds = this.viewer.viewport.getBounds();
						if (bounds.x <= 0 && bounds.y <= 0) {
							return;
						}

						const offsetX = (options.pages[0] ? 0 : 1);
						this.viewer.viewport.panTo({
							x: (bounds.x > 0 ? (bounds.width / 2) + offsetX : options.panX),
							y: (bounds.y > 0 ? (bounds.height / 2) : options.panY),
						});
					}
				});

				this.viewer.open(tileSources);
				return;
			}

			// https://openseadragon.github.io/examples/tilesource-iiif/
			this.viewer = OpenSeadragon({
				animationTime: .4,
				element: this.$refs.image,
				immediateRender: true,
				preload: !this.$root.isMobile(),
				preserveImageSizeOnResize: true,
				preserveViewport: true,
				showNavigationControl: false,
				showZoomControl: false,
				tileSources,
				visibilityRatio: .2,
				...this.$root.options.viewer,
			});

			this.viewer.gestureSettingsMouse.clickToZoom = false;

			this.viewer.addHandler('animation-finish', () => {
				if (this.isReset) {
					this.removeScanOptions();
					return;
				}

				const center = this.viewer.viewport.getCenter();
				this.$root.updateOptions({
					// 3 decimals are sufficient, keeping URL short
					panX: Math.round(center.x * 1e3) / 1e3,
					panY: Math.round(center.y * 1e3) / 1e3,
					zoom: Math.round(this.viewer.viewport.getZoom() * 1e3) / 1e3,
				});
			});

			// Required for touchscreens:
			// The canvas swallows the touch event, so click-outside is not triggered
			this.viewer.addHandler('canvas-click', () => {
				document.body.click();
			});

			this.viewer.addHandler('open', () => {
				this.startLoadingWatch();

				if (options.panX !== null && options.panY !== null) {
					this.viewer.viewport.panTo({
						x: options.panX,
						y: options.panY,
					}, true);
					this.viewer.viewport.zoomTo(options.zoom, null, true);
				} else {
					this.viewer.viewport.goHome();
				}

				if (options.rotation !== null) {
					this.viewer.viewport.setRotation(options.rotation);
				}
			});

			this.viewer.addHandler('tile-load-failed', (error) => {
				this.$root.error = `Error loading image: ${error.message}`;
			});

			this.$root.expose(this.viewer, 'viewer');
			this.$root.expose(this.resetViewer);
		},
		loadImageInfo(resetViewer = false) {
			this.stopLoadingWatch();

			const infoPromises = [];
			this.$root.options.pages.forEach((page) => {
				if (page < 1 || this.tileSources[page]) {
					return;
				}

				const { resource } = this.$root.canvases[page - 1].images[0];
				if (resource.service) {
					const id = resource.service['@id'];
					const infoUrl = `${id}${id.slice(-1) === '/' ? '' : '/'}info.json`;
					infoPromises.push(this.$http.get(infoUrl).then((response) => ({ ...response, page }), (error) => {
						let status;
						if (error.response && error.response.statusText) {
							status = error.response.statusText;
						} else if (error.message) {
							status = error.message;
						}
						this.$root.error = `Error loading info file for page ${page}${status ? `: ${status}` : ''}`;
					}));
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
				Promise.all(infoPromises).then((responses) => {
					responses.forEach((response) => {
						if (response) {
							this.tileSources[response.page] = response.data;
						}
					});
					this.initViewer(resetViewer);
				});
			} else {
				this.initViewer(resetViewer);
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

			if (event.shiftKey && zeroKeyCodes.indexOf(event.keyCode) > -1) {
				this.resetViewer(event);
			}
		},
		onKeypress(event) {
			if (this.preventKeyboardEvent(event)) {
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
			case 'I': {
				this.resetFilters();
				break;
			}
			default:
				// Send keypress event to OpenSeadragon
				this.propagateKeypress(event);
			}
		},
		propagateKeypress(event) {
			if (event.target.className.indexOf('openseadragon') === 0) {
				return;
			}

			const canvas = this.$refs.image.querySelector('.openseadragon-canvas');
			if (!canvas) {
				return;
			}

			const canvasEvent = new event.constructor(event.type, event);

			// Chrome fix: OpenSeadragon evaluates keyCode
			Object.defineProperty(canvasEvent, 'keyCode', {
				get() {
					return event.keyCode;
				},
			});

			canvas.dispatchEvent(canvasEvent);
		},
		resetFilters() {
			this.$refs.image.style.cssText = '';
			this.$root.updateOptions({ filters: {} });
		},
		removeScanOptions() {
			this.$root.updateOptions({
				panX: null,
				panY: null,
				zoom: null,
			});
		},
		resetViewer(includingFiltersAndRotation) {
			if (includingFiltersAndRotation) {
				// Rotation has to be reset before pan and zoom
				this.viewer.viewport.setRotation(0);
				this.$root.updateOptions({ rotation: null });
				if (this.filtersActive) {
					this.resetFilters();
				}
			}

			this.viewer.viewport.goHome();
			this.removeScanOptions();
		},
		rotateRight(event) {
			const { viewport } = this.viewer;
			const degrees = (event && event.shiftKey) ? 0 : (viewport.getRotation() + 90) % 360;
			viewport.setRotation(degrees);
			this.$root.updateOptions({ rotation: degrees || null });
		},
		setFilter(name, event) {
			const value = event.target.valueAsNumber;
			if (value === 1) {
				this.$delete(this.$root.options.filters, name);
			} else {
				this.$set(this.$root.options.filters, name, value);
			}
			this.$root.updateOptions({ filters: this.$root.options.filters });
			this.updateFilterStyle();
		},
		startLoadingWatch() {
			let loading = 0;
			for (let i = this.viewer.world.getItemCount() - 1; i >= 0; i -= 1) {
				const image = this.viewer.world.getItemAt(i);
				// eslint-disable-next-line no-underscore-dangle
				if (image && image._tilesLoading) {
					loading = 1;
				}
			}
			this.$root.loading = loading;

			// TODO: A timeout instead of a proper event handler? Abomination!
			// That's because neither getFullyLoaded() nor the fully-loaded-change
			// event are working for images that are not currently within canvas
			// bounds. OpenSeadragon, get your shit together, and add a global
			// fully-loaded event, not just for each TiledImage.
			this.loadingTimeout = setTimeout(this.startLoadingWatch, 200);
		},
		stopLoadingWatch() {
			clearTimeout(this.loadingTimeout);
		},
		updateFilterStyle() {
			if (!this.filtersActive || !this.cssFiltersSupported) {
				return;
			}

			const filters = [];
			Object.keys(this.$root.options.filters).forEach((key) => {
				filters.push(`${key}(${this.$root.options.filters[key]})`);
			});

			const { image } = this.$refs;
			const filterString = filters.join(' ');

			image.style.cssText = vendorPrefixes.join(`filter:${filterString};`);
		},
		zoomIn() {
			this.viewer.viewport.zoomBy(this.zoomFactor);
		},
		zoomOut() {
			this.viewer.viewport.zoomBy(1 / this.zoomFactor);
		},
	},
	mounted() {
		this.loadImageInfo();
		this.updateFilterStyle();

		window.addEventListener('keydown', this.onKeydown);
		window.addEventListener('keypress', this.onKeypress);
	},
	beforeDestroy() {
		this.viewer.destroy();

		window.removeEventListener('keydown', this.onKeydown);
		window.removeEventListener('keypress', this.onKeypress);
	},
};
</script>
