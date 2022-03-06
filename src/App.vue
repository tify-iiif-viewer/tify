<template>
	<!-- NOTE: Root element must be focusable for global keyboard events to work -->
	<div class="tify" tabindex="-1">
		<app-header
			v-if="$root.manifest"
			:fulltextEnabled="hasOtherContent"
			:tocEnabled="hasToc"
		/>

		<div v-if="$root.manifest" class="tify-main">
			<view-scan
				:id="$root.getId('scan')"
			/>
			<view-fulltext
				:id="$root.getId('fulltext')"
				v-if="hasOtherContent"
				v-show="$root.options.view === 'fulltext'"
			/>
			<view-toc
				:id="$root.getId('toc')"
				v-if="hasToc"
				v-show="$root.options.view === 'toc'"
			/>
			<view-thumbnails
				:id="$root.getId('thumbnails')"
				v-show="$root.options.view === 'thumbnails'"
			/>
			<view-info
				:id="$root.getId('info')"
				v-show="$root.options.view === 'info'"
			/>
			<view-export
				:id="$root.getId('export')"
				v-show="$root.options.view === 'export'"
			/>
			<view-help
				:id="$root.getId('help')"
				v-show="$root.options.view === 'help'"
			/>
		</div>

		<div
			v-if="$root.loading"
			class="tify-loading"
			:aria-label="$root.translation ? $root.translate('Loading') : 'Loading'"
		/>

		<div v-if="$root.error" class="tify-error">
			<button class="tify-error-close" @click="$root.error = ''">
				<icon-close/>
			</button>
			<!-- NOTE: Error messages can contain user-controlled content -->
			<span>{{ $root.error }}</span>
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
		const manifestUrlQuery = this.$root.getQueryParam('manifest');
		this.$root.manifestUrl = this.$root.options.manifestUrl || manifestUrlQuery;

		if (!this.$root.manifestUrl) {
			this.$root.error = 'Missing option "manifestUrl" or query parameter "manifest"';
			return;
		}

		if (this.$root.options.manifestUrl && manifestUrlQuery) {
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
			let resolveFunction;
			let rejectFunction;
			const promise = new Promise((resolve, reject) => {
				resolveFunction = resolve;
				rejectFunction = reject;
			});

			if (language === 'en') {
				this.$root.translation = null;
				resolveFunction(language);
				return promise;
			}

			const translationUrl = `${this.$root.options.translationsDirUrl}/${language}.json`;
			this.$http.get(translationUrl).then((response) => {
				this.$root.options.language = language;
				this.$root.translation = response.data;
				resolveFunction(language);
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.$root.error = `Error loading translation for "${language}": ${status}`;
				rejectFunction(new Error(this.$root.error));
			});

			return promise;
		},
	},
	beforeDestroy() {
		window.removeEventListener('popstate', this.$root.updateOptionsFromUrlQuery);
	},
};
</script>

<style src="./styles/main.scss" lang="scss"></style>
