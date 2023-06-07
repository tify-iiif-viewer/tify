<template>
	<article
		class="tify"
		tabindex="-1"
	>
		<!-- NOTE: Root element must be focusable for global keyboard events to work -->
		<app-header
			v-if="ready && ($store.collection || $store.manifest)"
			:fulltext-enabled="hasOtherContent"
			:toc-enabled="hasToc"
		/>

		<div
			v-if="ready"
			class="tify-main"
		>
			<template v-if="$store.manifest">
				<!-- Scan must come first, other views in arbitrary order -->
				<view-scan :id="$store.getId('scan')" />

				<view-fulltext
					v-if="hasOtherContent"
					v-show="$store.options.view === 'fulltext'"
					:id="$store.getId('fulltext')"
				/>
				<view-thumbnails
					v-show="$store.options.view === 'thumbnails'"
					:id="$store.getId('thumbnails')"
				/>
				<view-toc
					v-if="hasToc"
					v-show="$store.options.view === 'toc'"
					:id="$store.getId('toc')"
				/>
				<view-export
					v-show="$store.options.view === 'export'"
					:id="$store.getId('export')"
				/>
			</template>

			<view-info
				v-if="$store.collection || $store.manifest"
				v-show="$store.options.view === 'info'"
				:id="$store.getId('info')"
			/>
			<view-collection
				v-if="$store.collection"
				v-show="$store.options.view === 'collection'"
				:id="$store.getId('collection')"
			/>
			<view-help
				v-show="$store.options.view === 'help'"
				:id="$store.getId('help')"
			/>
		</div>

		<div
			v-if="$store.loading"
			class="tify-loading"
			:aria-label="$translate('Loading')"
		/>

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
				<icon-close />
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

<script>
export default {
	props: {
		readyPromise: {
			type: Object,
			default: null,
		},
	},
	data() {
		return {
			ready: false,
		};
	},
	computed: {
		hasOtherContent() {
			return this.$store.canvases.some((canvas) => 'otherContent' in canvas);
		},
		hasToc() {
			return this.$store.manifest && this.$store.manifest.structures && this.$store.manifest.structures.length > 0;
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
			this.$nextTick(() => {
				this.ready = true;
				this.readyPromise.resolve();
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
			let resolveFunction;
			let rejectFunction;
			const promise = new Promise((resolve, reject) => {
				resolveFunction = resolve;
				rejectFunction = reject;
			});

			if (language === 'en') {
				this.$store.options.language = 'en';
				this.$translate.setTranslation(null);
				resolveFunction(language);
				return promise;
			}

			if (this.$store.options.translationsDirUrl === null) {
				rejectFunction(new Error('Could not determine translationsDirUrl'));
				return promise;
			}

			const translationUrl = `${this.$store.options.translationsDirUrl}/${language}.json`;
			this.$store.fetchJson(translationUrl).then((loadedTranslation) => {
				this.$store.options.language = language;
				this.$translate.setTranslation(loadedTranslation);
				resolveFunction(language);
			}, (error) => {
				const status = error.response ? error.response.statusText : error.message;
				this.$store.addError(`Error loading translation for "${language}": ${status}`);
				rejectFunction(new Error(error));
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

<style src="./styles/main.scss" lang="scss"></style>
