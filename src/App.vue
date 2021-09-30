<template>
	<div class="tify-app">
		<app-header
			v-if="$root.manifest"
			:fulltextEnabled="hasOtherContent"
			:tocEnabled="hasToc"
		/>

		<div v-if="$root.manifest" class="tify-app_main">
			<scan/>
			<fulltext v-if="hasOtherContent" v-show="$root.params.view === 'fulltext'"/>
			<toc v-if="hasToc" v-show="$root.params.view === 'toc'"/>
			<thumbnails v-show="$root.params.view === 'thumbnails'"/>
			<info v-show="$root.params.view === 'info'"/>
			<export v-show="$root.params.view === 'export'"/>
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
				<icon name="close"/>
			</button>
			<span v-html="$root.error"/>
		</div>
	</div>
</template>

<script>
import httpClient from '@/services/http-client';

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
	computed: {
		hasOtherContent() {
			return this.$root.canvases.some((canvas) => 'otherContent' in canvas);
		},
		hasToc() {
			return !!(this.$root.manifest.structures && this.$root.manifest.structures.length);
		},
	},
	mounted() {
		httpClient.interceptors.request.use((request) => {
			this.$root.loading += 1;
			return request;
		});

		httpClient.interceptors.response.use((response) => {
			if (this.$root.loading > 0) {
				this.$root.loading -= 1;
			}

			return response;
		}, (error) => {
			this.$root.loading = 0;
			return Promise.reject(error);
		});

		// Manifest URL in tifyOptions trumps query param
		// Support `manifestUrl` for backward compatibility if `manifest` is not set
		this.$root.manifestUrl = this.$root.options.manifest
				|| this.$root.getQueryParam('manifest')
				|| this.$root.getQueryParam('manifestUrl');

		if (!this.$root.manifestUrl) {
			this.$root.error = 'Missing query parameter or option: manifest';
			return;
		}

		if (this.$root.options.manifest && this.$root.params.manifest) {
			this.$root.error = 'Setting manifest via query parameter is disabled';
			return;
		}

		// Load manifest
		httpClient.get(this.$root.manifestUrl).then((response) => {
			const manifest = response.data;
			const manifestValid = this.$root.validateManifest(manifest);

			if (manifestValid) {
				this.$root.manifest = manifest;

				// Merging user-set query params with defaults
				this.$root.params = this.$root.getParams();

				window.addEventListener('popstate', () => {
					this.$root.params = this.$root.getParams();
				});

				if (this.$root.options.title) {
					window.document.title = `${this.$root.convertValueToArray(this.$root.manifest.label)[0]}`
							+ ` | ${this.$root.options.title}`;
				}
			} else {
				this.$root.error = 'Please provide a valid IIIF Presentation API 2.x manifest';
			}
		}, (error) => {
			const status = (error.response ? error.response.statusText : error.message);
			this.$root.error = `Error loading IIIF manifest: ${status}`;
		});

		// Load translation
		if (this.$root.options.language !== 'en') {
			const translationUrl = `${this.$root.base}/translations/${this.$root.options.language}.json`;
			httpClient.get(translationUrl).then((response) => {
				this.$root.messages = response.data;
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.$root.error = `Error loading translation ${this.$root.options.language}: ${status}`;
				console.warn(this.$root.error); // eslint-disable-line no-console
			});
		}
	},
};
</script>

<style src="@/styles/main.scss" lang="scss"></style>
