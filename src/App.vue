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
	created() {
		this.$api.expose(this.setLanguage);
		this.$api.expose(this.$store.setPage);
	},
	mounted() {
		this.$store.rootElement = this.$el;

		if (!this.$store.options.manifestUrl) {
			this.$store.addError('Missing option "manifestUrl"');
			return;
		}

		// Set current breakpoint as classes on container element for use in CSS
		this.updateBreakpoint();
		new ResizeObserver(this.updateBreakpoint).observe(this.$el);

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
		updateBreakpoint() {
			Object.keys(this.$store.options.breakpoints).forEach((breakpoint) => {
				if (this.$el.clientWidth <= this.$store.options.breakpoints[breakpoint]) {
					this.$el.classList.add(`-${breakpoint}`);
				} else {
					this.$el.classList.remove(`-${breakpoint}`);
				}
			});

			if (this.$el.clientHeight < 520) {
				this.$el.classList.add('-short');
			} else {
				this.$el.classList.remove('-short');
			}
		},
	},
};
</script>

<template>
	<article
		class="tify"
		tabindex="-1"
	>
		<!-- NOTE: Root element must be focusable for global keyboard events to work -->
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
				<ViewScan :id="$store.getId('scan')" />

				<ViewFulltext
					v-if="$store.options.views.includes('fulltext') && hasAnnotations"
					v-show="$store.options.view === 'fulltext'"
					:id="$store.getId('fulltext')"
				/>
				<ViewThumbnails
					v-show="$store.options.views.includes('thumbnails') && $store.options.view === 'thumbnails'"
					:id="$store.getId('thumbnails')"
				/>
				<ViewToc
					v-if="$store.options.views.includes('toc') && hasToc"
					v-show="$store.options.view === 'toc'"
					:id="$store.getId('toc')"
				/>
				<ViewExport
					v-if="$store.options.views.includes('export')"
					v-show="$store.options.view === 'export'"
					:id="$store.getId('export')"
				/>
			</template>

			<ViewInfo
				v-if="$store.options.views.includes('info') && ($store.collection || $store.manifest)"
				v-show="$store.options.view === 'info'"
				:id="$store.getId('info')"
			/>
			<ViewCollection
				v-if="$store.options.views.includes('collection') && $store.collection"
				v-show="$store.options.view === 'collection'"
				:id="$store.getId('collection')"
			/>
			<ViewHelp
				v-if="$store.options.views.includes('help')"
				v-show="$store.options.view === 'help'"
				:id="$store.getId('help')"
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
				<p v-for="error in $store.errors" :key="error">
					{{ error }}
				</p>
			</div>
		</section>
	</article>
</template>

<style src="./styles/main.scss" lang="scss"></style>
