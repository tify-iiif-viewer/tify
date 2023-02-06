<template>
	<section class="tify-fulltext" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Fulltext') }}</h2>

		<div v-if="fulltextAvailable" class="tify-fulltext-texts">
			<div v-for="page in pages" class="tify-fulltext-page" :key="page">
			<h3>
				{{ $root.translate('Page') }}
				{{ $root.getPageLabel(page, $root.canvases[page - 1].label) }}
			</h3>
			<div
				v-for="(text, index) in fulltexts[page]"
				v-html="text"
				class="tify-fulltext-text"
				:key="`${page}-${index}`"
			/>
			</div>
		</div>

		<div v-else class="tify-fulltext-none">
			{{ $root.translate('Fulltext not available for this page') }}
		</div>
	</section>
</template>

<script>
import isValidUrl from '@/functions/isValidUrl';

export default {
	data() {
		return {
			fulltextAvailable: false,
			fulltexts: [],
		};
	},
	watch: {
		// eslint-disable-next-line func-names
		'$root.options.pages': function () {
			this.loadFulltexts();
		},
	},
	methods: {
		loadFulltexts() {
			this.fulltextAvailable = false;
			this.fulltexts = [];

			this.$root.options.pages.forEach((page) => {
				if (page < 1 || this.fulltexts[page]) {
					return;
				}

				const canvas = this.$root.canvases[page - 1];
				if (!('otherContent' in canvas)) {
					return;
				}

				const annotationListUrl = canvas.otherContent[0]['@id'];
				this.$http.get(annotationListUrl).then((response) => {
					const { resources } = response.data;
					if (!Array.isArray(resources)) {
						return;
					}

					resources.forEach((resource, index) => {
						const res = resource.resource;
						if (!res) return;
						if (!this.fulltexts[page]) {
							this.$set(this.fulltexts, page, []);
						}
						if (res && res.chars) {
							const text = this.$root.filterHtml(res.chars);
							if (text) {
								this.fulltextAvailable = true;
							}

							this.$set(this.fulltexts[page], index, text);
						} else if (res['@id']) {
							this.loadRemoteFulltext(page, index, res['@id']);
						}
					});
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					// eslint-disable-next-line no-console
					console.warn(`Could not load annotations: ${status}`);
				});
			});
		},
		loadRemoteFulltext(page, index, url) {
			// Only attempt to load remote fulltext if we got a valid URL
			// TODO: Add support for dctypes
			if (!isValidUrl(url)) {
				return;
			}

			this.$http.get(url).then((response2) => {
				const text = this.$root.filterHtml(response2.data);
				if (text) {
					this.fulltextAvailable = true;
				}

				this.$set(this.fulltexts[page], index, text);
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				// eslint-disable-next-line no-console
				console.warn(`Could not load fulltext: ${status}`);
			});
		},
	},
	mounted() {
		this.loadFulltexts();
	},
	computed: {
		pages() {
			return this.$root.options.pages.filter((page) => !!(page));
		},
	},
};
</script>
