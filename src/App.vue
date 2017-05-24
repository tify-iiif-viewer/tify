<template>
	<div class="tify-app">
		<app-header
			v-if="manifest"
			:manifest="manifest"
			:panel="params.panel"
			:exportEnabled="hasExport"
			:tocEnabled="hasToc"
			:fulltextEnabled="hasOtherContent"
			@togglePanel="togglePanel"
		/>

		<div v-if="manifest" class="tify-app_main">
			<scan
				:apiVersion="apiVersion"
				:canvases="canvases"
				:structures="manifest.structures"
				:page="params.page"
				:panX="params.panX"
				:panY="params.panY"
				:zoom="params.zoom"
				@setPage="setPage"
				@updateParams="updateParams"
			/>

			<fulltext
				v-if="hasOtherContent && params.panel === 'fulltext'"
				:canvases="canvases"
				:page="params.page"
			/>

			<toc
				v-if="hasToc && params.panel === 'toc'"
				:canvases="canvases"
				:structures="manifest.structures"
				:page="params.page"
				@setPage="setPage"
			/>

			<thumbnails
				v-if="params.panel === 'thumbnails'"
				:apiVersion="apiVersion"
				:canvases="canvases"
				:page="params.page"
				@setPage="setPage"
			/>

			<info
				v-if="params.panel === 'info'"
				:manifest="manifest"
			/>

			<export
				v-if="hasExport && params.panel === 'export'"
				:exportItems="manifest.seeAlso"
				:renderingItems="manifest.rendering"
			/>

			<help
				v-if="params.panel === 'help'"
			/>
		</div>

		<div v-if="$root.loading" class="tify-app_loading">
			<span class="tify-sr-only">{{ 'Loading'|trans }}</span>
		</div>

		<div v-if="$root.error" class="tify-app_error">
			<span v-html="$root.error"></span>
			<button class="tify-app_error-close" @click="$root.error = ''">
				<i class="tify-icon">close</i>
			</button>
		</div>
	</div>
</template>

<script>
	import AppHeader from '@/components/Header';
	import Export from '@/panels/Export';
	import Fulltext from '@/panels/Fulltext';
	import Help from '@/panels/Help';
	import Info from '@/panels/Info';
	import Scan from '@/panels/Scan';
	import Thumbnails from '@/panels/Thumbnails';
	import Toc from '@/panels/Toc';

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
				manifest: null,
				params: {},
			};
		},
		computed: {
			apiVersion() {
				if (this.manifest['@context'] === 'http://iiif.io/api/presentation/1/context.json') return 1;
				return 2;
			},
			canvases() {
				return this.manifest.sequences[0].canvases;
			},
			hasExport() {
				return (this.manifest.rendering || this.manifest.seeAlso);
			},
			hasOtherContent() {
				return this.canvases.some(canvas => 'otherContent' in canvas);
			},
			hasToc() {
				return (this.manifest.structures && this.manifest.structures.length);
			},
			pageCount() {
				return this.canvases.length;
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
			getParams() {
				const params = JSON.parse(this.getQueryParam('tify')) || {};
				return {
					page: (this.isValidPage(params.page) ? params.page : 1),
					panel: typeof params.panel !== 'undefined' ? params.panel : 'info',
					panX: parseFloat(params.panX) || null,
					panY: parseFloat(params.panY) || null,
					zoom: parseFloat(params.zoom) || null,
				};
			},
			getQueryParam(name) {
				const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
				return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
			},
			isValidPage(page) {
				return (!isNaN(page) && page > 0 && page <= this.pageCount);
			},
			setPage(page) {
				this.$root.error = '';
				if (this.isValidPage(page)) {
					this.updateParams({ page });
				} else {
					this.$root.error = 'Invalid page';
				}
			},
			updateParams(params) {
				const doPush = ('page' in params && params.page !== this.params.page);

				Object.keys(params).forEach((key) => {
					this.params[key] = params[key];
				});

				if (!window.history) return;

				const regex = /([?&])tify=.*?(&|$)/;
				const tifyParams = `tify=${JSON.stringify(this.params)}`;
				const uri = window.location.href;
				const newUrl = uri.match(regex)
					? uri.replace(regex, `$1${tifyParams}$2`)
					: `${uri}${uri.indexOf('?') < 0 ? '?' : '&'}${tifyParams}`;

				if (doPush) {
					window.history.pushState({}, '', newUrl);
				} else {
					window.history.replaceState({}, '', newUrl);
				}
			},
			togglePanel(name) {
				this.updateParams({ panel: (name === this.params.panel ? '' : name) });
			},
		},
		created() {
			// TODO: Mock $root.options instead, this is only required for unit testing
			if (!this.$root.options) this.$root.options = {};

			// Manifest URL in tifyOptions trumps query param
			const manifestUrl = this.$root.options.manifestUrl || this.getQueryParam('manifestUrl');
			if (!manifestUrl) {
				this.$root.error = 'Missing query parameter or option: manifestUrl';
				return;
			} else if (this.$root.options.manifestUrl && this.params.manifestUrl) {
				this.$root.error = 'Setting manifestUrl via query parameter is disabled';
			}

			this.$http.get(manifestUrl).then((response) => {
				this.manifest = response.data;

				// Merging user-set query params with defaults
				this.params = this.getParams();
				window.addEventListener('popstate', () => {
					this.params = this.getParams();
				});

				if (this.$root.options.title) {
					window.document.title = `${this.manifest.label} | ${this.$root.options.title}`;
				}
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.$root.error = `Error loading IIIF manifest: ${status}`;
			});

			window.addEventListener('keyup', (event) => {
				if (['INPUT', 'SELECT', 'TEXTAREA'].indexOf(event.target.nodeName) > -1) return;

				if (event.key === 'q' || event.key === ',') {
					if (this.params.page > 1) this.setPage(this.params.page - 1);
				} else if (event.key === 'e' || event.key === '.') {
					if (this.params.page < this.pageCount) this.setPage(this.params.page + 1);
				} else if (event.key === 'Q') {
					this.setPage(1);
				} else if (event.key === 'E') {
					this.setPage(this.pageCount);
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
