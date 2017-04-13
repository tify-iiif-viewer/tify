<template>
	<div class="tify-app">
		<app-header
			v-if="manifest"
			:manifest="manifest"
			:panel="params.panel"
			:exportEnabled="!!manifest.rendering || !!manifest.seeAlso"
			:tocEnabled="!!manifest.structures"
			:transcriptEnabled="hasOtherContent"
			@togglePanel="togglePanel"
		/>

		<div v-if="manifest" class="tify-app_main">
			<scan
				:canvases="canvases"
				:structures="manifest.structures"
				:page="params.page"
				:panX="params.panX"
				:panY="params.panY"
				:zoom="params.zoom"
				@setPage="setPage"
				@updateParams="updateParams"
			/>

			<transcript
				v-if="hasOtherContent && params.panel === 'transcript'"
				:canvases="canvases"
				:page="params.page"
			/>

			<toc
				v-if="manifest.structures && params.panel === 'toc'"
				:canvases="canvases"
				:structures="manifest.structures"
				:page="params.page"
				@setPage="setPage"
			/>

			<thumbnails
				v-if="params.panel === 'thumbnails'"
				:canvases="canvases"
				:page="params.page"
				@setPage="setPage"
			/>

			<info
				v-if="params.panel === 'info'"
				:manifest="manifest"
			/>

			<export
				v-if="!!manifest.seeAlso && params.panel === 'export'"
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
			<span class="tify-app_error-message">
				<i class="tify-icon">error</i>
				<span v-html="$root.error"></span>
			</span>
			<button class="tify-app_error-close" @click="$root.error = ''">
				<i class="tify-icon">close</i>
			</button>
		</div>
	</div>
</template>

<script>
	import AppHeader from '@/components/Header';
	import Export from '@/panels/Export';
	import Help from '@/panels/Help';
	import Info from '@/panels/Info';
	import Scan from '@/panels/Scan';
	import Thumbnails from '@/panels/Thumbnails';
	import Toc from '@/panels/Toc';
	import Transcript from '@/panels/Transcript';

	export default {
		components: {
			AppHeader,
			Export,
			Help,
			Info,
			Scan,
			Thumbnails,
			Toc,
			Transcript,
		},
		data() {
			return {
				manifest: null,
				params: {},
			};
		},
		computed: {
			canvases() {
				return this.manifest.sequences[0].canvases;
			},
			hasOtherContent() {
				return this.canvases.some(canvas => 'otherContent' in canvas);
			},
			pageCount() {
				return this.canvases.length;
			},
		},
		methods: {
			isValidPage(page) {
				return (!isNaN(page) && page > 0 && page <= this.pageCount);
			},
			setPage(page) {
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

				const hashes = [];
				Object.keys(this.params).forEach((key) => {
					if (this.params[key] !== null) hashes.push(`${key}=${this.params[key]}`);
				});

				const newUrl = `${window.location.pathname}?${hashes.join('&')}`;
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
			// Get query params. Note that all query params are strings.
			const queryTuples = window.location.search.substr(1).split('&');
			const params = {};
			for (let i = 0; i < queryTuples.length; i += 1) {
				const parts = queryTuples[i].split('=');
				params[parts[0]] = parts[1];
			}

			// Manifest URL in tifyOptions trumps query param
			const manifestUrl = this.$root.options.manifestUrl || params.manifestUrl;

			if (!manifestUrl) {
				this.$root.error = 'Missing query parameter or option: manifestUrl';
			} else if (this.$root.options.manifestUrl && this.params.manifestUrl) {
				this.$root.error = 'Setting manifestUrl via query parameter is disabled';
			}

			this.$http.get(manifestUrl).then((response) => {
				this.manifest = response.data;

				// Merging user-set query params with defaults
				const page = parseInt(params.page, 10);
				this.params = {
					manifestUrl: params.manifestUrl || null,
					page: (this.isValidPage(page) ? page : 1),
					panel: typeof params.panel !== 'undefined' ? params.panel : 'info',
					panX: parseFloat(params.panX) || null,
					panY: parseFloat(params.panY) || null,
					zoom: parseFloat(params.zoom) || null,
				};

				if (this.$root.options.title) {
					window.document.title = `${this.manifest.label} | ${this.$root.options.title}`;
				}
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.$root.error = `Error loading IIIF manifest: ${status}`;
			});

			// TODO: Remove unused key codes
			// TODO: Move keys to scan, or move function required for pagination to App?
			const keys = {
				pageUp: 33,
				pageDown: 34,
				end: 35,
				home: 36,
				i: 73,
				k: 75,
				l: 76,
				o: 79,
				r: 82,
				numpad0: 96,
				add: 107,
				substract: 109,
				comma: 188,
				period: 190,
			};

			window.addEventListener('keyup', (event) => {
				switch (event.keyCode) {
				case keys.pageUp:
				case keys.comma:
					if (this.params.page > 1) this.setPage(this.params.page - 1);
					break;
				case keys.pageDown:
				case keys.period:
					if (this.params.page < this.pageCount) this.setPage(this.params.page + 1);
					break;
				case keys.k:
					// TODO: Skip to previous section
					break;
				case keys.l:
					// TODO: Skip to next section
					break;
				case keys.home:
					this.setPage(1);
					break;
				case keys.end:
					this.setPage(this.pageCount);
					break;
				default:
				}
			});
		},
	};
</script>

<style lang="scss">
	@import 'styles/main';
</style>
