<template>
	<div class="tify-app">
		<app-header v-if="manifestLoaded" @togglePanel="togglePanel" :manifest="manifest" :panel="params.panel"/>

		<div v-if="manifestLoaded" class="tify-app_main">
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
				v-if="false && params.panel === 'transcript'"
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

			<metadata
				v-if="params.panel === 'metadata'"
				:metadata="manifest.metadata"
			/>

			<help
				v-if="params.panel === 'help'"
			/>
		</div>

		<div v-if="$root.loading" class="tify-app_loading">
			<span class="tify-sr-only">{{ 'Loading'|trans }}</span>
		</div>

		<div v-if="$root.errorMessage" class="tify-app_error" v-html="$root.errorMessage"></div>
	</div>
</template>

<script>
	import AppHeader from '@/components/Header';
	import Scan from '@/panels/Scan';
	import Transcript from '@/panels/Transcript';
	import Toc from '@/panels/Toc';
	import Thumbnails from '@/panels/Thumbnails';
	import Metadata from '@/panels/Metadata';
	import Help from '@/panels/Help';

	export default {
		components: {
			AppHeader,
			Scan,
			Transcript,
			Toc,
			Thumbnails,
			Metadata,
			Help,
		},
		data() {
			// Get query params
			const hashes = window.location.search.substr(1).split('&');
			let params = {};
			for (let i = 0; i < hashes.length; i += 1) {
				const parts = hashes[i].split('=');
				params[parts[0]] = parts[1];
			}

			// Merge user-set query params with defaults
			params = {
				manifest: params.manifest || this.$root.options.manifest || null,
				page: parseInt(params.page, 10) || 1,
				panel: typeof params.panel !== 'undefined' ? params.panel : 'metadata',
				panX: parseFloat(params.panX) || null,
				panY: parseFloat(params.panY) || null,
				zoom: parseFloat(params.zoom) || null,
			};

			return {
				manifestLoaded: false,
				manifest: {},
				params,
			};
		},
		computed: {
			canvases() {
				return this.manifest.sequences[0].canvases;
			},
			pageCount() {
				return this.manifest.sequences[0].canvases.length;
			},
		},
		methods: {
			error(message) {
				this.$root.errorMessage = message;
				this.$root.loading = false;
				throw new Error(message);
			},
			setPage(page) {
				if (isNaN(page) || page < 1 || page > this.pageCount) {
					this.error('Invalid page');
				}
				this.updateParams({ page });
			},
			updateParams(params) {
				Object.keys(params).forEach((key) => {
					this.params[key] = params[key];
				});

				if (!window.history) return;

				const hashes = [];
				Object.keys(this.params).forEach((key) => {
					hashes.push(`${key}=${this.params[key]}`);
				});
				window.history.pushState({}, '', `${window.location.pathname}?${hashes.join('&')}`);
			},
			togglePanel(name) {
				this.updateParams({ panel: (name === this.params.panel ? '' : name) });
			},
		},
		created() {
			if (!this.params.manifest) {
				this.error('Missing query parameter or option: manifest');
			}

			this.$http.get(this.params.manifest).then((response) => {
				this.manifest = response.data;
				if (this.$root.options.title) {
					window.document.title = `${this.manifest.label} | ${this.$root.options.title}`;
				}
				this.manifestLoaded = true;
			}, () => {
				this.error('Error loading IIIF manifest');
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
