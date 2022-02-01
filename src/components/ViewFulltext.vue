<template>
	<section class="tify-fulltext" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Fulltext') }}</h2>

		<div v-if="fulltextAvailable" class="tify-fulltext-texts">
			<template v-for="(page, index) in pages">
				<hr :key="index" v-if="index && page > 1" class="tify-fulltext-separator">
				<div :key="index" v-for="(text, index) in fulltexts[page]" class="tify-fulltext-text" v-html="text">
				</div>
			</template>
		</div>

		<div v-else class="tify-fulltext-none">
			{{ $root.translate('Fulltext not available for this page') }}
		</div>
	</section>
</template>

<script>
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

				this.$set(this.fulltexts, page, []);

				const annotationListUrl = canvas.otherContent[0]['@id'];
				this.$http.get(annotationListUrl).then((response) => {
					const { resources } = response.data;
					if (!Array.isArray(resources)) {
						return;
					}

					resources.forEach((resource, index) => {
						const res = resource.resource;
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
