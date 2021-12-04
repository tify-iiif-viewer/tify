<template>
	<!-- NOTE: Root element must be focusable for global keyboard events to work -->
	<div class="tify-app" tabindex="-1">
		<app-header
			v-if="$root.manifest"
			:fulltextEnabled="hasOtherContent"
			:tocEnabled="hasToc"
		/>

		<div v-if="$root.manifest" class="tify-app_main">
			<view-scan/>
			<view-fulltext v-if="hasOtherContent" v-show="$root.options.view === 'fulltext'"/>
			<view-toc v-if="hasToc" v-show="$root.options.view === 'toc'"/>
			<view-thumbnails v-show="$root.options.view === 'thumbnails'"/>
			<view-info v-show="$root.options.view === 'info'"/>
			<view-export v-show="$root.options.view === 'export'"/>
			<view-help v-show="$root.options.view === 'help'"/>
		</div>

		<div
			v-if="$root.loading"
			class="tify-app_loading"
			:class="{'-centered' : !$root.manifest}"
		>
			<span class="tify-sr-only">
				{{ $root.translation ? $root.translate('Loading') : 'Loading' }}
			</span>
		</div>

		<div v-if="$root.error" class="tify-app_error">
			<button class="tify-app_error-close" @click="$root.error = ''">
				<icon-close/>
			</button>
			<span v-html="$root.error"/>
		</div>
	</div>
</template>

<script>
import AppHeader from './components/AppHeader';
import ViewExport from './components/ViewExport';
import ViewFulltext from './components/ViewFulltext';
import ViewHelp from './components/ViewHelp';
import ViewInfo from './components/ViewInfo';
import ViewScan from './components/ViewScan';
import ViewThumbnails from './components/ViewThumbnails';
import ViewToc from './components/ViewToc';

export default {
	components: {
		AppHeader,
		ViewExport,
		ViewHelp,
		ViewInfo,
		ViewScan,
		ViewThumbnails,
		ViewToc,
		ViewFulltext,
	},
	computed: {
		hasOtherContent() {
			return this.$root.canvases.some((canvas) => 'otherContent' in canvas);
		},
		hasToc() {
			return !!(this.$root.manifest.structures && this.$root.manifest.structures.length);
		},
	},
	created() {
		this.$root.expose(this.setLanguage);
	},
	mounted() {
		this.$http.interceptors.request.use((request) => {
			this.$root.loading += 1;
			return request;
		});

		this.$http.interceptors.response.use((response) => {
			if (this.$root.loading > 0) this.$root.loading -= 1;
			return response;
		}, (error) => {
			this.$root.loading = 0;
			return Promise.reject(error);
		});

		// Manifest URL set in options trumps query param
		this.$root.manifestUrl = this.$root.options.manifestUrl || this.$root.getQueryParam('manifest');

		if (!this.$root.manifestUrl) {
			this.$root.error = 'Missing option "manifestUrl" or query parameter "manifest"';
			return;
		}

		if (this.$root.options.manifestUrl && this.$root.options.manifest) {
			this.$root.error = 'Manifest URL is set via option, ignoring query parameter "manifest"';
			return;
		}

		this.loadManifest(this.$root.manifestUrl);
		this.setLanguage(this.$root.options.language);
	},
	methods: {
		loadManifest(manifestUrl) {
			this.$root.manifest = null;

			this.$http.get(manifestUrl).then((response) => {
				const manifest = response.data;
				if (this.$root.isManifest(manifest)) {
					this.$root.manifest = manifest;

					// Merging user-set query params with defaults
					this.$root.updateOptionsFromUrlQuery();
					window.addEventListener('popstate', this.$root.updateOptionsFromUrlQuery);

					if (this.$root.options.title) {
						window.document.title = this.$root.convertValueToArray(this.$root.manifest.label)[0]
							+ this.$root.options.titleAffix;
					}

					this.$nextTick(() => this.$root.readyPromise.resolve());
				} else {
					this.$root.error = 'Please provide a valid IIIF Presentation API 2.x manifest';
					this.$root.readyPromise.reject(this.$root.error);
				}
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.$root.error = `Error loading IIIF manifest: ${status}`;
				this.$root.readyPromise.reject(this.$root.error);
			});
		},
		setLanguage(language) {
			this.$root.options.language = language;

			if (language === 'en') {
				this.$root.translation = null;
				return;
			}

			const translationUrl = `${this.$root.options.translationsDirUrl}/${language}.json`;
			this.$http.get(translationUrl).then((response) => {
				this.$root.translation = response.data;
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.$root.error = `Error loading translation ${language}: ${status}`;
				console.warn(this.$root.error); // eslint-disable-line no-console
			});
		},
	},
	beforeDestroy() {
		window.removeEventListener('popstate', this.$root.updateOptionsFromUrlQuery);
	},
};
</script>

<style src="./styles/main.scss" lang="scss"></style>
