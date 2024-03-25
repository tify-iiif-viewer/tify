<template>
	<section
		class="tify-fulltext"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Fulltext') }}
		</h2>

		<div
			v-if="fulltextAvailable !== false"
			class="tify-fulltext-texts"
		>
			<div
				v-for="page in pages"
				:key="page"
				class="tify-fulltext-page"
			>
				<h3>
					{{ $translate('Page') }}
					{{ $store.getPageLabel(page, $store.localize($store.manifest.items[page - 1].label)) }}
				</h3>
				<div
					v-for="(text, index) in fulltexts[page]"
					:key="`${page}-${index}`"
					class="tify-fulltext-text"
					v-html="text"
				/>
			</div>
		</div>

		<div
			v-else
			class="tify-fulltext-none"
		>
			{{ $translate('Fulltext not available for this page') }}
		</div>
	</section>
</template>

<script>
import { filterHtml } from '../modules/filter';
import { isValidUrl } from '../modules/validation';

export default {
	data() {
		return {
			fulltextAvailable: null,
			fulltexts: [],
		};
	},
	computed: {
		pages() {
			return this.$store.options.pages.filter((page) => !!page);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.pages': function () {
			this.loadFulltexts();
		},
	},
	mounted() {
		this.loadFulltexts();
	},
	methods: {
		loadFulltexts() {
			this.fulltextAvailable = null;
			this.fulltexts = [];

			this.$store.options.pages.forEach((page) => {
				if (page < 1 || this.fulltexts[page]) {
					return;
				}

				const canvas = this.$store.manifest.items[page - 1];
				if (!('annotations' in canvas)) {
					this.fulltextAvailable = false;
					return;
				}

				const annotationListUrl = canvas.annotations[0].id;

				this.$store.fetchJson(annotationListUrl).then(
					(data) => {
						const { resources } = data;
						if (!(resources instanceof Array)) {
							return;
						}

						resources.forEach((resource, index) => {
							const res = resource.resource;

							if (!res) {
								return;
							}

							if (!this.fulltexts[page]) {
								this.fulltexts[page] = [];
							}

							if (res && res.chars) {
								const text = filterHtml(res.chars);
								if (text) {
									this.fulltextAvailable = true;
								}

								this.fulltexts[page][index] = text;
							} else if (res.id || res['@id']) {
								this.loadRemoteFulltext(page, index, res.id || res['@id']);
							}
						});
					},
					(error) => {
						const status = error.response ? error.response.statusText : error.message;
						// eslint-disable-next-line no-console
						console.warn(`Could not load annotations: ${status}`);
						this.fulltextAvailable = false;
					},
				);
			});
		},
		loadRemoteFulltext(page, index, url) {
			// TODO: Add support for dctypes

			if (!isValidUrl(url)) {
				return;
			}

			this.$store.fetchText(url).then(
				(html) => {
					const text = filterHtml(html);
					if (text) {
						this.fulltextAvailable = true;
					}

					if (!this.fulltexts[page]) {
						this.fulltexts[page] = [];
					}

					this.fulltexts[page][index] = text;
				},
				(error) => {
					const status = error.response ? error.response.statusText : error.message;
					// eslint-disable-next-line no-console
					console.warn(`Could not load fulltext: ${status}`);
				},
			);
		},
	},
};
</script>
