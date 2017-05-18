<template>
	<section class="tify-scan">
		<h2 class="tify-sr-only">{{ 'Scan'|trans }}</h2>

		<div class="tify-scan_buttons">
			<button
				class="tify-scan_button"
				:disabled="page === 1"
				:title="'First page'|trans"
				@click="setPage(1)"
			>
				<i class="tify-icon">first_page</i>
				<span class="tify-sr-only">{{ 'First page'|trans }}</span>
			</button>

			<button
				v-if="structures && structures.length"
				class="tify-scan_button"
				:disabled="page === 1"
				:title="'Previous section'|trans"
				@click="goToPreviousSection()"
			>
				<i class="tify-icon">skip_previous</i>
				<span class="tify-sr-only">{{ 'Previous section'|trans }}</span>
			</button>

			<button
				class="tify-scan_button"
				:disabled="page === 1"
				:title="'Previous page'|trans"
				@click="setPage(page - 1)"
			>
				<i class="tify-icon">navigate_before</i>
				<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
			</button>

			<button
				class="tify-scan_button"
				:disabled="this.page === canvases.length"
				:title="'Next page'|trans"
				@click="setPage(page + 1)"
			>
				<i class="tify-icon">navigate_next</i>
				<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
			</button>

			<button
				v-if="structures && structures.length"
				class="tify-scan_button"
				:disabled="page >= lastSection.firstPage"
				:title="'Next section'|trans"
				@click="goToNextSection()"
			>
				<i class="tify-icon">skip_next</i>
				<span class="tify-sr-only">{{ 'Next section'|trans }}</span>
			</button>

			<button
				class="tify-scan_button"
				:disabled="page === canvases.length"
				:title="'Last page'|trans"
				@click="setPage(canvases.length)"
			>
				<i class="tify-icon">last_page</i>
				<span class="tify-sr-only">{{ 'Last page'|trans }}</span>
			</button>
		</div>

		<div class="tify-scan_buttons">
			<page-select
				class="tify-scan_button"
				:canvases="canvases"
				:page="page"
				@setPage="setPage"
			/>
		</div>

		<div class="tify-scan_buttons -vertical">
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
	import PageSelect from '@/components/PageSelect';

	export default {
		components: {
			PageSelect,
		},
		props: [
			'apiVersion',
			'canvases',
			'structures',
			'page',
			'panX',
			'panY',
			'zoom',
		],
		data() {
			return {
				currentSectionIndex: 0,
				id: '',
				sections: [],
				viewer: null,
				zoomFactor: 1.5,
			};
		},
		computed: {
			currentSection() {
				return this.sections[this.currentSectionIndex];
			},
			lastSection() {
				return this.sections[this.sections.length - 1];
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
			page() {
				this.loadImageInfo();
				this.updateCurrentSessionIndex();
			},
		},
		methods: {
			goToNextSection() {
				let sectionIndex = this.currentSectionIndex + 1;
				while (
					this.sections[sectionIndex]
					&& this.currentSection.firstPage >= this.sections[sectionIndex].firstPage
				) sectionIndex += 1;
				this.setPage(this.sections[sectionIndex].firstPage);
			},
			goToPreviousSection() {
				let sectionIndex = this.currentSectionIndex - 1;
				if (!this.sections[sectionIndex]) return;
				while (
					this.sections[sectionIndex]
					&& this.currentSection.firstPage <= this.sections[sectionIndex].firstPage
				) sectionIndex -= 1;
				this.setPage(this.sections[sectionIndex].firstPage);
			},
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
					initialPage: this.page - 1,
					tileSources,
					visibilityRatio: .2,
				});

				this.viewer.gestureSettingsMouse.clickToZoom = false;

				this.viewer.addHandler('open', () => {
					if (this.zoom !== null) {
						this.viewer.viewport.zoomTo(this.zoom, null, true);
					}

					if (this.panX !== null && this.panY !== null) {
						this.viewer.viewport.panTo({ x: this.panX, y: this.panY }, true);
					}
				});

				this.viewer.addHandler('tile-load-failed', (error) => {
					this.$root.error = `Error loading image for page ${this.page}: ${error.message}`;
				});

				// TODO: Loading is regarded as complete once the first tile has been downloaded.
				// OpenSeadragon will probably get a new 'fully-loaded' event with the next release.
				this.viewer.addHandler('tile-loaded', () => { this.$root.loading = 0; });

				this.viewer.addHandler('animation-finish', this.updateParams);
			},
			loadImageInfo() {
				this.id = this.canvases[this.page - 1].images[0].resource.service['@id'];
				const infoUrl = `${this.id}/info.json`;
				this.$http.get(infoUrl).then((response) => {
					this.initOpenSeadragon(response.data);
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.$root.error = `Error loading info file for page ${this.page}: ${status}`;
				});
			},
			resetView() {
				this.viewer.viewport.goHome();
			},
			setPage(page) {
				this.$emit('setPage', page);
			},
			updateCurrentSessionIndex() {
				// Find the last section containing the current page
				this.sections.forEach((section, index) => {
					if (this.page >= section.firstPage && this.page <= section.lastPage) {
						this.currentSectionIndex = index;
					}
				});
			},
			updateParams() {
				const center = this.viewer.viewport.getCenter();
				const zoom = this.viewer.viewport.getZoom();
				this.$emit('updateParams', {
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

			if (!this.structures) return;

			const sections = [];
			this.structures.forEach((structure) => {
				const firstCanvasId = structure.canvases[0];
				const firstPage = this.canvases.findIndex(canvas => canvas['@id'] === firstCanvasId) + 1;
				const lastCanvasId = structure.canvases[structure.canvases.length - 1];
				const lastPage = this.canvases.findIndex(canvas => canvas['@id'] === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});
			this.sections = sections;

			this.updateCurrentSessionIndex();
		},
	};
</script>
