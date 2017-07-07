<template>
	<section class="tify-scan">
		<h2 class="tify-sr-only">{{ 'Scan'|trans }}</h2>

		<div class="tify-scan_buttons" v-if="viewer">
			<button
				class="tify-scan_button"
				:disabled="isMaxZoom"
				:title="'Zoom in'|trans"
				@click="zoomIn"
			>
				<i class="tify-icon">zoom_in</i>
				<span class="tify-sr-only">{{ 'Zoom in'|trans }}</span
			></button>
			<button
				class="tify-scan_button"
				:disabled="isReset"
				:title="'Reset view'|trans"
				@click="resetView"
			>
				<i class="tify-icon">settings_overscan</i>
				<span class="tify-sr-only">{{ 'Reset view'|trans }}</span>
			</button>
			<button
				class="tify-scan_button"
				:disabled="isMinZoom"
				:title="'Zoom out'|trans"
				@click="zoomOut"
			>
				<i class="tify-icon">zoom_out</i>
				<span class="tify-sr-only">{{ 'Zoom out'|trans }}</span>
			</button>

			<button
				class="tify-scan_button"
				:class="{ '-active': $root.params.rotation }"
				:title="'Rotate view'|trans"
				@click="rotateRight"
			>
				<i class="tify-icon">rotate_right</i>
				<span class="tify-sr-only">{{ 'Rotate view'|trans }}</span>
			</button>

			<div
				class="tify-scan_filters"
				v-click-outside="closeFilters"
				:class="{ '-open': filtersVisible }"
			>
				<button
					class="tify-scan_button"
					:class="{ '-active': filtersActive }"
					:title="'Toggle image adjustments'|trans"
					@click="filtersVisible = !filtersVisible"
				>
					<i class="tify-icon">tune</i>
					<span class="tify-sr-only">{{ 'Toggle image adjustments'|trans }}</span>
				</button>
				<div class="tify-scan_filter-popup" v-show="filtersVisible">
					<p>
						<label for="tify-scan_brightness">
							<i class="tify-icon -light">wb_sunny</i>
							{{ 'Brightness:'|trans }}
							{{ Math.round(($root.params.filters.brightness || 1) * 100) }}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_brightness"
							max="3"
							min=".5"
							step=".01"
							type="range"
							:value="$root.params.filters.brightness || 1"
							@input="setFilter('brightness', $event)"
						>
					</p>
					<p>
						<label for="tify-scan_contrast">
							<i class="tify-icon -light">brightness_medium</i>
							{{ 'Contrast:'|trans }}
							{{ Math.round(($root.params.filters.contrast || 1) * 100) }}&nbsp;%
						</label>
						<input
							class="tify-scan_range"
							id="tify-scan_contrast"
							max="3"
							min=".5"
							step=".01"
							type="range"
							:value="$root.params.filters.contrast || 1"
							@input="setFilter('contrast', $event)"
						>
					</p>
					<p>
						<button class="tify-scan_reset" :disabled="!filtersActive" @click="resetFilters">
							<i class="tify-icon">settings_backup_restore</i>
							{{ 'Reset'|trans }}
						</button>
					</p>
				</div>
			</div>
		</div>

		<div class="tify-scan_image" id="tify-scan_image" ref="image"></div>
	</section>
</template>

<script>
	import openSeadragon from 'openseadragon';

	export default {
		data() {
			return {
				filtersVisible: false,
				isReset: false,
				isResetting: false,
				tileSources: {},
				viewer: null,
				zoomFactor: 1.5,
			};
		},
		computed: {
			apiVersion() {
				return (this.$root.manifest['@context'] === 'http://iiif.io/api/presentation/1/context.json' ? 1 : 2);
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
			initViewer(resetView) {
				this.$root.loading += 1;

				const currentTileSources = [];
				this.$root.params.pages.forEach((page) => {
					if (page > 0) currentTileSources.push(this.tileSources[page]);
				});

				// TODO: All tile sources could be added at once (sequence mode)
				// This requires the correct resolution to be present in the manifest, which is
				// currently loaded from the info file since the former is unreliable.
				const tileSources = [];
				const initialWidth = currentTileSources[0].width;
				let totalWidth = (this.$root.params.pages[0] < 1 ? 1 : 0);
				currentTileSources.forEach((tileSource) => {
					const width = tileSource.width / initialWidth;
					tileSources.push({
						tileSource,
						width,
						x: totalWidth,
					});
					totalWidth += width + .01;
				});

				if (this.viewer) {
					if (resetView) {
						this.viewer.addOnceHandler('open', () => {
							this.resetView();
						});
					}

					this.viewer.open(tileSources);
					return;
				}

				// https://openseadragon.github.io/examples/tilesource-iiif/
				this.viewer = openSeadragon({
					animationTime: .4,
					id: 'tify-scan_image',
					// TODO: This should be re-evaluted on resize
					immediateRender: this.$root.isMobile(),
					preserveImageSizeOnResize: true,
					preserveViewport: true,
					showNavigationControl: false,
					showZoomControl: false,
					tileSources,
					visibilityRatio: .2,
				});

				this.viewer.gestureSettingsMouse.clickToZoom = false;

				this.viewer.addHandler('animation-finish', () => {
					if (this.isResetting) {
						this.isReset = true;
						this.isResetting = false;
					} else {
						this.isReset = false;
						const center = this.viewer.viewport.getCenter();
						this.$root.updateParams({
							// 3 decimals are sufficient, keeping URL short
							panX: Math.round(center.x * 1e3) / 1e3,
							panY: Math.round(center.y * 1e3) / 1e3,
							zoom: Math.round(this.viewer.viewport.getZoom() * 1e3) / 1e3,
						});
					}
				});

				this.viewer.addHandler('open', () => {
					if (this.$root.params.panX !== null && this.$root.params.panY !== null) {
						this.viewer.viewport.panTo({
							x: this.$root.params.panX,
							y: this.$root.params.panY,
						}, true);
					}

					if (this.$root.params.rotation !== null) {
						this.viewer.viewport.setRotation(this.$root.params.rotation);
					}

					if (this.$root.params.zoom !== null) {
						this.viewer.viewport.zoomTo(this.$root.params.zoom, null, true);
					}
				});


				this.viewer.addHandler('tile-load-failed', (error) => {
					this.$root.error = `Error loading image for page ${this.$root.params.page}: ${error.message}`;
				});

				// TODO: Loading is regarded as complete once the first tile has been downloaded.
				// OpenSeadragon will probably get a new 'fully-loaded' event with the next release.
				this.viewer.addHandler('tile-loaded', () => {
					this.$root.loading = 0;
				});
			},
			loadImageInfo(resetView = false) {
				const infoPromises = [];
				this.$root.params.pages.forEach((page) => {
					if (page < 1 || this.tileSources[page]) return;

					const resource = this.$root.canvases[page - 1].images[0].resource;
					if (resource.service) {
						const infoUrl = `${resource.service['@id']}/info.json`;
						infoPromises.push(this.$http.get(infoUrl).then((response) => {
							response.page = page;
							return response;
						}, (error) => {
							const status = (error.response ? error.response.statusText : error.message);
							this.$root.error = `Error loading info file for page ${page}: ${status}`;
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
							const info = response.data;
							this.tileSources[response.page] = {
								'@context': `http://iiif.io/api/image/${this.apiVersion}/context.json`,
								'@id': info['@id'],
								height: info.height,
								width: info.width,
								profile: [`http://iiif.io/api/image/${this.apiVersion}/level2.json`],
								protocol: 'http://iiif.io/api/image',
								tiles: info.tiles,
							};
						});
						this.initViewer(resetView);
					});
				} else {
					this.initViewer(resetView);
				}
			},
			resetFilters() {
				const image = this.$refs.image;
				image.style.filter = '';
				image.style.webkitFilter = '';
				this.$root.updateParams({ filters: {} });
			},
			resetView() {
				this.$root.updateParams({
					panX: null,
					panY: null,
					zoom: null,
				});

				this.isResetting = true;
				this.viewer.viewport.goHome();
			},
			rotateRight() {
				const viewport = this.viewer.viewport;
				const degrees = (viewport.getRotation() + 90) % 360;
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
			updateFilterStyle() {
				if (!this.filtersActive) return;

				const filters = [];
				Object.keys(this.$root.params.filters).forEach((key) => {
					filters.push(`${key}(${this.$root.params.filters[key]})`);
				});

				const image = this.$refs.image;
				const filterString = filters.join(' ');
				image.style.filter = filterString;
				image.style.webkitFilter = filterString;
			},
			zoomIn() {
				this.viewer.viewport.zoomBy(this.zoomFactor);
			},
			zoomOut() {
				this.viewer.viewport.zoomBy(1 / this.zoomFactor);
			},
		},
		mounted() {
			const params = this.$root.params;
			this.isReset = (params.panX === null && params.panY === null && params.zoom === null);
			this.loadImageInfo();
			this.updateFilterStyle();
		},
	};
</script>
