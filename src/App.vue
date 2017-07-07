<template>
	<div class="tify-app">
		<app-header
			v-if="$root.manifest"
			:exportEnabled="hasExport"
			:fulltextEnabled="hasOtherContent"
			:tocEnabled="hasToc"
		/>

		<div v-if="$root.manifest" class="tify-app_main">
			<scan/>
			<fulltext v-if="hasOtherContent" v-show="$root.params.view === 'fulltext'"/>
			<toc v-if="hasToc" v-show="$root.params.view === 'toc'"/>
			<thumbnails v-show="$root.params.view === 'thumbnails'"/>
			<info v-show="$root.params.view === 'info'"/>
			<export v-if="hasExport" v-show="$root.params.view === 'export'"/>
			<help v-show="$root.params.view === 'help'"/>
		</div>

		<div
			v-if="$root.loading"
			class="tify-app_loading"
			:class="{'-centered' : !$root.manifest}"
		>
			<span class="tify-sr-only">{{ 'Loading'|trans }}</span>
		</div>

		<div v-if="$root.error" class="tify-app_error">
			<button class="tify-app_error-close" @click="$root.error = ''">
				<i class="tify-icon">close</i>
			</button>
			<span v-html="$root.error"></span>
		</div>
	</div>
</template>

<script>
	import AppHeader from '@/components/Header';
	import Export from '@/views/Export';
	import Fulltext from '@/views/Fulltext';
	import Help from '@/views/Help';
	import Info from '@/views/Info';
	import Scan from '@/views/Scan';
	import Thumbnails from '@/views/Thumbnails';
	import Toc from '@/views/Toc';

	export default {
		components: {
			AppHeader,
			Export,
			Help,
			Info,
			Scan,
			Thumbnails,
			Toc,
			Fulltext,
		},
		data() {
			return {
				params: {},
			};
		},
		computed: {
			hasExport() {
				return (this.$root.manifest.rendering || this.$root.manifest.seeAlso);
			},
			hasOtherContent() {
				return this.$root.canvases.some(canvas => 'otherContent' in canvas);
			},
			hasToc() {
				return (this.$root.manifest.structures && this.$root.manifest.structures.length);
			},
		},
		methods: {
			forwardToScan(event) {
				if (event.target.className.indexOf('openseadragon') === 0) return;
				if (['INPUT', 'SELECT', 'TEXTAREA'].indexOf(event.target.nodeName) > -1) return;

				const canvas = this.$el.getElementsByClassName('openseadragon-canvas')[0];
				if (!canvas) return;

				const canvasEvent = new event.constructor(event.type, event);

				// Chrome fix: OpenSeadragon evaluates keyCode
				Object.defineProperty(canvasEvent, 'keyCode', { get() { return event.keyCode; } });

				canvas.dispatchEvent(canvasEvent);
			},
		},
		mounted() {
			window.addEventListener('keyup', (event) => {
				if (['INPUT', 'SELECT', 'TEXTAREA'].indexOf(event.target.nodeName) > -1) return;

				const pages = this.$root.params.pages;
				if (event.key === 'q' || event.key === ',') {
					if (pages[0] > 1) this.$root.setPage(pages[0] - 1);
				} else if (event.key === 'e' || event.key === '.') {
					if (pages[pages.length - 1] < this.$root.pageCount) {
						this.$root.setPage(pages[0] + 1);
					}
				} else if (event.key === 'Q') {
					this.$root.setPage(1);
				} else if (event.key === 'E') {
					this.$root.setPage(this.$root.pageCount);
				} else if (event.key === 'x') {
					const pageSelect = this.$el.getElementsByClassName('tify-page-select_button')[0];
					if (pageSelect) pageSelect.click();
				} else {
					this.forwardToScan(event);
				}
			});

			window.addEventListener('keydown', this.forwardToScan);

			window.addEventListener('keypress', this.forwardToScan);
		},
	};
</script>

<style lang="scss">
	@import 'styles/main';
</style>
