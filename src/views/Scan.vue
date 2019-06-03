<template>
	<section class="tify-scan">
		<h2 class="tify-sr-only">{{ 'Scan'|trans }}</h2>

		<button
			v-if="!customPageViewActive && !isFirstPage"
			class="tify-scan_page-button -previous"
			:title="'Previous page'|trans"
			@click="goToPreviousPage"
		>
			<icon name="navigate_before"/>
			<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
		</button>
		<button
			v-if="!customPageViewActive && !isLastPage"
			class="tify-scan_page-button -next"
			:title="'Next page'|trans"
			@click="goToNextPage"
		>
			<icon name="navigate_next"/>
			<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
		</button>

		<div class="tify-scan_buttons" v-if="viewer">
			<button
				class="tify-scan_button"
				:disabled="isMaxZoom"
				:title="'Zoom in'|trans"
				@click="zoomIn"
			>
				<icon name="zoom_in"/>
				<span class="tify-sr-only">{{ 'Zoom in'|trans }}</span>
			</button>
			<button
				class="tify-scan_button"
				:disabled="isReset"
				:title="'Reset'|trans"
				@click="resetView($event)"
			>
				<icon name="aspect_ratio"/>
				<span class="tify-sr-only">{{ 'Reset'|trans }}</span>
			</button>
			<button
				class="tify-scan_button"
				:disabled="isMinZoom"
				:title="'Zoom out'|trans"
				@click="zoomOut"
			>
				<icon name="zoom_out"/>
				<span class="tify-sr-only">{{ 'Zoom out'|trans }}</span>
			</button>

			<button
				class="tify-scan_button"
				:class="{ '-active': $root.params.rotation }"
				:title="'Rotate'|trans"
				@click="rotateRight($event)"
			>
				<icon name="rotate_right"/>
				<span class="tify-sr-only">{{ 'Rotate'|trans }}</span>
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
					:title="'Toggle image filters'|trans"
					@click="filtersVisible = !filtersVisible"
				>
					<icon name="tune"/>
					<span class="tify-sr-only">{{ 'Toggle image filters'|trans }}</span>
				</button>
				<div class="tify-scan_filter-popup" v-show="filtersVisible">
					<p>
						<label for="tify-scan_brightness">
							<icon name="wb_sunny" class="-light"/>
							{{ 'Brightness:'|trans }}
							{{ Math.round(($root.params.filters.brightness || 1) * 100) }}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_brightness"
							max="2"
							min=".5"
							ref="firstSlider"
							step=".01"
							type="range"
							:value="$root.params.filters.brightness || 1"
							@input="setFilter('brightness', $event)"
						>
					</p>
					<p>
						<label for="tify-scan_contrast">
							<icon name="brightness_medium" class="-light"/>
							{{ 'Contrast:'|trans }}
							{{ Math.round(($root.params.filters.contrast || 1) * 100) }}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_contrast"
							max="2"
							min=".5"
							step=".01"
							type="range"
							:value="$root.params.filters.contrast || 1"
							@input="setFilter('contrast', $event)"
						>
					</p>
					<p>
						<label for="tify-scan_saturation">
							<icon name="palette" class="-light"/>
							{{ 'Saturation:'|trans }}
							{{ Math.round($root.params.filters.saturate * 100 || 100)}}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_saturation"
							max="3"
							min="0"
							step=".01"
							type="range"
							:value="$root.params.filters.saturate || 1"
							@input="setFilter('saturate', $event)"
						>
					</p>
					<p>
						<button
							class="tify-scan_reset"
							:disabled="!filtersActive"
							@click="resetFilters"
						>
							<icon name="settings_backup_restore"/>
							{{ 'Reset'|trans }}
						</button>
					</p>
				</div>
			</div>
			<template v-if="detectFullscreen !== false">
				<template v-if="fullscreenActive">
					<button
						class="tify-scan_button exit_fullscreen"
						:title="'Exit fullscreen'|trans"
						@click="toggleFullscreen"
					>
						<icon name="fullscreen_exit"/>
						<span class="tify-sr-only">{{ 'Exit fullscreen'|trans }}</span>
					</button>
				</template>
				<template v-else>
					<button
						class="tify-scan_button fullscreen"
						:title="'Fullscreen'|trans"
						@click="toggleFullscreen"
					>
						<icon name="fullscreen"/>
						<span class="tify-sr-only">{{ 'Fullscreen'|trans }}</span>
					</button>
				</template>
			</template>
		</div>

		<div class="tify-scan_image" id="tify-scan_image" ref="image"/>
	</section>
</template>

<script>
	import OpenSeadragon from '@/../openseadragon/src/openseadragon';

	import keyboard from '@/mixins/keyboard';
	import pagination from '@/mixins/pagination';

	// TODO: Is there another way to make OpenSeadragon available to imports below?
	window.OpenSeadragon = OpenSeadragon;

	// Custom-build OpenSeadragon. Order is important!
	require('@/../openseadragon/src/controldock');
	require('@/../openseadragon/src/eventsource');

	require('@/../openseadragon/src/tilesource');

	require('@/../openseadragon/src/iiiftilesource');

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
				fullscreenActive: false,
				loadingTimeout: null,
				screen: this.$root.$el.parentNode,
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
				// documentMode is needed for false positives in oldIE, please see issue above
				return !!el.style.length
					&& ((document.documentMode === undefined || document.documentMode > 9));
			},
			filtersActive() {
				return (Object.keys(this.$root.params.filters).length > 0);
			},
			isMinZoom() {
				if (!this.viewer) return true;
				return this.viewer.viewport.getZoom() <= this.viewer.viewport.getMinZoom();
			},
			isMaxZoom() {
				if (!this.viewer) return true;
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
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function (newValue, oldValue) {
				const resetView = newValue.length !== oldValue.length;
				this.loadImageInfo(resetView);
			},
		},
		methods: {
			closeFilters() {
				this.filtersVisible = false;
			},
			detectFullscreen: () => {
				let fullscreenAPI;

				switch (null) {
				case document.msFullscreenElement:
					fullscreenAPI = document.msFullscreenElement;
					break;
				case document.webkitFullscreenElement:
					fullscreenAPI = document.webkitFullscreenElement;
					break;
				case document.fullscreenElement:
					fullscreenAPI = document.fullscreenElement;
					break;
				default:
					fullscreenAPI = false;
				}

				return fullscreenAPI;
			},
			initViewer(resetView) {
				const { params } = this.$root;

				// TODO: All tile sources could be added at once (sequence mode)
				// This requires the correct resolution to be present in the manifest, which is
				// currently loaded from the info file since the former is unreliable.
				const tileSources = [];
				let initialWidth = 0;
				let tileSourceIndex;
				let totalWidth = 0;
				params.pages.forEach((page, index) => {
					let opacity = 1;
					if (page < 1) {
						opacity = 0;
						tileSourceIndex = (index > 0 ? this.$root.pageCount : 1);
					} else {
						tileSourceIndex = page;
					}

					const tileSource = this.tileSources[tileSourceIndex];

					if (!tileSource) return;

					if (!initialWidth) initialWidth = tileSource.width;
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
						if (this.isReset || resetView) {
							this.resetView();
						} else {
							this.viewer.viewport.applyConstraints(true);

							// Move upper left corner into viewport if required
							const bounds = this.viewer.viewport.getBounds();
							if (bounds.x <= 0 && bounds.y <= 0) return;

							const offsetX = (params.pages[0] ? 0 : 1);
							this.viewer.viewport.panTo({
								x: (bounds.x > 0 ? (bounds.width / 2) + offsetX : params.panX),
								y: (bounds.y > 0 ? (bounds.height / 2) : params.panY),
							});
						}
					});

					this.viewer.open(tileSources);
					return;
				}

				// https://openseadragon.github.io/examples/tilesource-iiif/
				this.viewer = OpenSeadragon({
					animationTime: .4,
					id: 'tify-scan_image',
					immediateRender: this.$root.options.immediateRender,
					preload: !this.$root.isMobile(),
					preserveImageSizeOnResize: true,
					preserveViewport: true,
					showNavigationControl: false,
					showZoomControl: false,
					tileSources,
					visibilityRatio: .2,
				});

				this.viewer.gestureSettingsMouse.clickToZoom = false;

				this.viewer.addHandler('animation-finish', () => {
					if (this.isReset) {
						this.removeScanParams();
						return;
					}

					const center = this.viewer.viewport.getCenter();
					this.$root.updateParams({
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

					if (params.panX !== null && params.panY !== null) {
						this.viewer.viewport.panTo({
							x: params.panX,
							y: params.panY,
						}, true);
						this.viewer.viewport.zoomTo(params.zoom, null, true);
					} else {
						this.viewer.viewport.goHome();
					}

					if (params.rotation !== null) {
						this.viewer.viewport.setRotation(params.rotation);
					}
				});

				this.viewer.addHandler('tile-load-failed', (error) => {
					this.$root.error = `Error loading image: ${error.message}`;
				});
			},
			loadImageInfo(resetView = false) {
				this.stopLoadingWatch();

				const infoPromises = [];
				this.$root.params.pages.forEach((page) => {
					if (page < 1 || this.tileSources[page]) return;

					const { resource } = this.$root.canvases[page - 1].images[0];
					if (resource.service) {
						const id = resource.service['@id'];
						const infoUrl = `${id}${id.slice(-1) === '/' ? '' : '/'}info.json`;
						infoPromises.push(this.$http.get(infoUrl).then((response) => {
							response.page = page;
							return response;
						}, (error) => {
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
							if (response) this.tileSources[response.page] = response.data;
						});
						this.initViewer(resetView);
					});
				} else {
					this.initViewer(resetView);
				}
			},
			propagateKeyPress(event) {
				if (event.target.className.indexOf('openseadragon') === 0) return;

				const canvas = this.$refs.image.querySelector('.openseadragon-canvas');
				if (!canvas) return;

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
				this.$root.updateParams({ filters: {} });
			},
			removeScanParams() {
				this.$root.updateParams({
					panX: null,
					panY: null,
					zoom: null,
				});
			},
			resetView(event) {
				if (event && event.shiftKey) {
					// Rotation has to be reset before pan and zoom
					this.viewer.viewport.setRotation(0);
					this.$root.updateParams({ rotation: null });
					if (this.filtersActive) this.resetFilters();
				}

				this.viewer.viewport.goHome();
				this.removeScanParams();
			},
			rotateRight(event) {
				const { viewport } = this.viewer;
				const degrees = (event && event.shiftKey) ? 0 : (viewport.getRotation() + 90) % 360;
				viewport.setRotation(degrees);
				this.$root.updateParams({ rotation: degrees || null });
			},
			setFilter(name, event) {
				const value = event.target.valueAsNumber;
				if (value === 1) {
					this.$delete(this.$root.params.filters, name);
				} else {
					this.$set(this.$root.params.filters, name, value);
				}
				this.$root.updateParams({ filters: this.$root.params.filters });
				this.updateFilterStyle();
			},
			startLoadingWatch() {
				let loading = 0;
				for (let i = this.viewer.world.getItemCount() - 1; i >= 0; i -= 1) {
					const image = this.viewer.world.getItemAt(i);
					// eslint-disable-next-line no-underscore-dangle
					if (image && image._tilesLoading) loading = 1;
				}
				this.$root.loading = loading;

				// TODO: A timeout instead of a proper event handler? Abomination! That's because
				// neither getFullyLoaded() nor the fully-loaded-change event are working for images
				// that are not currently within canvas bounds. OpenSeadragon, get your shit
				// together, and add a global fully-loaded event, not just for each TiledImage.
				this.loadingTimeout = setTimeout(this.startLoadingWatch, 200);
			},
			stopLoadingWatch() {
				clearTimeout(this.loadingTimeout);
			},
			toggleFullscreen() {
				this.fullscreenActive = !this.fullscreenActive;
				if (this.detectFullscreen() !== null) {
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.mozCancelFullScreen) { // Firefox
						document.mozCancelFullScreen();
					} else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
						document.webkitExitFullscreen();
					} else if (document.msExitFullscreen) { // IE/Edge
						document.msExitFullscreen();
					}
				} else if (this.screen.requestFullscreen) {
					this.screen.requestFullscreen();
				} else if (this.screen.mozRequestFullScreen) { // Firefox
					this.screen.mozRequestFullScreen();
				} else if (this.screen.webkitRequestFullscreen) { // Chrome, Safari and Opera
					this.screen.webkitRequestFullscreen();
				} else if (this.screen.msRequestFullscreen) { // IE/Edge
					this.screen.msRequestFullscreen();
				}
			},
			updateFilterStyle() {
				if (!this.filtersActive || !this.cssFiltersSupported) return;

				const filters = [];
				Object.keys(this.$root.params.filters).forEach((key) => {
					filters.push(`${key}(${this.$root.params.filters[key]})`);
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

			window.addEventListener('keydown', (event) => {
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
					this.resetView(event);
				}
			});

			window.addEventListener('keypress', (event) => {
				if (this.preventKeyboardEvent(event)) return;

				switch (event.key) {
				case 'r':
				case 'R':
					// NOTE: Same physical key for QUERTY and QUERTZ keyboards
					this.rotateRight(event);
					break;
				case 'f':
					this.filtersVisible = !this.filtersVisible;
					if (this.filtersVisible) {
						this.$nextTick(() => {
							this.$refs.firstSlider.focus();
						});
					}
					break;
				case 'F': {
					this.resetFilters();
					break;
				}
				case 'u':
				case 'U':
					this.toggleFullscreen();
					break;
				default:
					// Send to OpenSeadragon
					this.propagateKeyPress(event);
				}
			});
		},
	};
</script>
