<script>
import { createPromise } from './modules/promise';

export default {
	props: {
		readyPromise: {
			type: Object,
			default: null,
			required: true,
		},
	},
	data() {
		return {
			readyToRender: false,
		};
	},
	computed: {
		hasAnnotations() {
			return this.$store.manifest?.items?.some((canvas) => 'annotations' in canvas);
		},
		hasToc() {
			return this.$store.structures.length > 0;
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.pages': function () {
			if (this.$store.annotationsActive) {
				this.$store.loadAnnotations();
			}
		},
		// eslint-disable-next-line func-names
		'$store.options.view': function () {
			if (this.$store.annotationsActive) {
				this.$store.loadAnnotations();
			}
		},
	},
	created() {
		this.$api.expose(this.setLanguage);
		this.$api.expose(this.$store.setPage);
		this.$api.expose(this.$store.updateOptions);
	},
	mounted() {
		this.$store.rootElement = this.$el;

		if (!this.$store.options.manifestUrl) {
			if (this.$store.options.contentStateEnabled) {
				const query = new URLSearchParams(window.location.search);
				this.$store.options.manifestUrl = query.get('iiif-content') || '';
			}

			if (!this.$store.options.manifestUrl) {
				this.$store.addError('Missing IIIF manifest URL');
				return;
			}
		}

		Promise.all([
			this.$store.loadManifest(this.$store.options.manifestUrl),
			this.setLanguage(this.$store.options.language),
		]).then(() => {
			this.readyToRender = true;

			// Wait for child components to be mounted
			this.$nextTick(() => {
				Promise.all(this.$store.readyPromises).then(() => {
					// Resolve at the very last
					setTimeout(this.readyPromise.resolve);
				});
			});
		}, (error) => {
			this.readyPromise.reject(error);
		});
	},
	beforeUnmount() {
		clearTimeout(this.$store.urlUpdateTimeout);
		window.removeEventListener('popstate', this.$store.initOptions);
	},
	methods: {
		setLanguage(language) {
			const promise = createPromise();

			if (language === 'en') {
				this.$store.options.language = 'en';
				this.$translate.setTranslation(null);
				promise.resolve(language);
				return promise;
			}

			if (this.$store.options.translationsDirUrl === null) {
				promise.reject(new Error('Could not determine translationsDirUrl'));
				return promise;
			}

			const translationUrl = `${this.$store.options.translationsDirUrl}/${language}.json`;
			this.$store.fetchJson(translationUrl).then((loadedTranslation) => {
				this.$store.options.language = language;
				this.$translate.setTranslation(loadedTranslation);
				promise.resolve(language);
			}, (error) => {
				// Allow the promise to resolve, but display an error message and keep the previous language
				const status = error.response ? error.response.statusText : error.message;
				this.$store.addError(`Error loading translation for "${language}": ${status}`);
				promise.resolve(this.$store.options.language);
			});

			return promise;
		},
	},
};
</script>

<!-- NOTE: tabindex makes root element focusable, which is required for global keyboard events to work -->
<!-- The first child of <template> must not be a comment, or rootElement breaks -->
<template>
	<article
		class="tify"
		:class="$store.options.colorMode === 'auto' ? '' : `-${$store.options.colorMode}`"
		tabindex="-1"
	>
		<AppHeader
			v-if="readyToRender && ($store.collection || $store.manifest)"
			:fulltextEnabled="hasAnnotations"
			:tocEnabled="hasToc"
		/>

		<div
			v-if="readyToRender"
			class="tify-main"
		>
			<template v-if="$store.manifest">
				<!-- Scan must come first, other views in arbitrary order -->
				<ViewScan :id="$getId('scan')" />

				<ViewFulltext
					v-if="hasAnnotations"
					v-show="$store.options.view === 'fulltext'"
					:id="$getId('fulltext')"
				/>
				<ViewThumbnails
					v-show="$store.options.view === 'thumbnails'"
					:id="$getId('thumbnails')"
				/>
				<ViewToc
					v-if="hasToc"
					v-show="$store.options.view === 'toc'"
					:id="$getId('toc')"
				/>
			</template>

			<ViewExport
				v-if="$store.collection || $store.manifest"
				v-show="$store.options.view === 'export'"
				:id="$getId('export')"
			/>
			<ViewInfo
				v-if="$store.collection || $store.manifest"
				v-show="$store.options.view === 'info'"
				:id="$getId('info')"
			/>
			<ViewCollection
				v-if="$store.collection"
				v-show="$store.options.view === 'collection'"
				:id="$getId('collection')"
			/>
			<ViewHelp
				v-show="$store.options.view === 'help'"
				:id="$getId('help')"
			/>
		</div>

		<div
			v-if="$store.loading"
			class="tify-loading"
			role="status"
		>
			<span class="tify-sr-only">{{ $translate('Loading') }}</span>
		</div>

		<section
			v-if="$store.errors.length"
			class="tify-error"
		>
			<button
				type="button"
				class="tify-error-close"
				:aria-label="$translate('Dismiss')"
				@click="$store.clearErrors()"
			>
				<IconClose />
			</button>
			<div class="tify-error-messages">
				<!-- NOTE: Error messages can contain user-controlled content -->
				<p
					v-for="error in $store.errors"
					:key="error"
				>
					{{ error }}
				</p>
			</div>
		</section>
	</article>
</template>

<style src="./styles/main.scss" lang="scss"></style>
