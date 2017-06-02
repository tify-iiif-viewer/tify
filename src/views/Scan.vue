<template>
	<section class="tify-scan">
		<h2 class="tify-sr-only">{{ 'Scan'|trans }}</h2>

		<div class="tify-scan_buttons">
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
		</div>

		<div class="tify-scan_image" id="scan_image"></div>
	</section>
</template>

<script>
	import openSeadragon from 'openseadragon';

	export default {
		data() {
			return {
				id: '',
				viewer: null,
				zoomFactor: 1.5,
			};
		},
		computed: {
			apiVersion() {
				return (this.$root.manifest['@context'] === 'http://iiif.io/api/presentation/1/context.json' ? 1 : 2);
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
			'$root.params.page': function () {
				this.loadImageInfo();
			},
		},
		methods: {
			initOpenSeadragon(info) {
				this.$root.loading += 1;

				// TODO: All tile sources could be added at once (sequence mode)
				// This requires the correct to be present resolution in the manifest, which is
				// currently loaded from the info file since the former is unreliable.
				const tileSources = [
					{
						'@context': `http://iiif.io/api/image/${this.apiVersion}/context.json`,
						'@id': this.id,
						height: info.height,
						width: info.width,
						profile: [`http://iiif.io/api/image/${this.apiVersion}/level2.json`],
						protocol: 'http://iiif.io/api/image',
						tiles: info.tiles,
					},
				];

				if (this.viewer) {
					this.viewer.open(tileSources);
					return;
				}

				// https://openseadragon.github.io/examples/tilesource-iiif/
				this.viewer = openSeadragon({
					animationTime: .5,
					id: 'scan_image',
					preserveImageSizeOnResize: true,
					preserveViewport: true,
					showNavigationControl: false,
					showZoomControl: false,
					initialPage: this.$root.params.page - 1,
					tileSources,
					visibilityRatio: .2,
				});

				this.viewer.gestureSettingsMouse.clickToZoom = false;

				this.viewer.addHandler('open', () => {
					if (this.$root.params.zoom !== null) {
						this.viewer.viewport.zoomTo(this.$root.params.zoom, null, true);
					}

					if (this.$root.params.panX !== null && this.$root.params.panY !== null) {
						this.viewer.viewport.panTo({
							x: this.$root.params.panX,
							y: this.$root.params.panY,
						}, true);
					}
				});

				this.viewer.addHandler('tile-load-failed', (error) => {
					this.$root.error = `Error loading image for page ${this.$root.params.page}: ${error.message}`;
				});

				// TODO: Loading is regarded as complete once the first tile has been downloaded.
				// OpenSeadragon will probably get a new 'fully-loaded' event with the next release.
				this.viewer.addHandler('tile-loaded', () => { this.$root.loading = 0; });

				this.viewer.addHandler('animation-finish', this.updateParams);
			},
			loadImageInfo() {
				this.id = this.$root.canvases[this.$root.params.page - 1].images[0].resource.service['@id'];
				const infoUrl = `${this.id}/info.json`;
				this.$http.get(infoUrl).then((response) => {
					this.initOpenSeadragon(response.data);
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.$root.error = `Error loading info file for page ${this.$root.params.page}: ${status}`;
				});
			},
			resetView() {
				this.viewer.viewport.goHome();
			},
			updateParams() {
				const center = this.viewer.viewport.getCenter();
				const zoom = this.viewer.viewport.getZoom();
				this.$root.updateParams({
					// 3 decimals are sufficient, keeping URL short
					panX: Math.round(center.x * 1e3) / 1e3,
					panY: Math.round(center.y * 1e3) / 1e3,
					zoom: Math.round(zoom * 1e3) / 1e3,
				});
			},
			zoomIn() {
				this.viewer.viewport.zoomBy(this.zoomFactor);
			},
			zoomOut() {
				this.viewer.viewport.zoomBy(1 / this.zoomFactor);
			},
		},
		created() {
			this.loadImageInfo();
		},
	};
</script>
