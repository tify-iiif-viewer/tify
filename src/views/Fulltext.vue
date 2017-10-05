<template>
	<section class="tify-fulltext">
		<h2 class="tify-sr-only">{{ 'Fulltext'|trans }}</h2>

		<div v-if="fulltextAvailable" class="tify-fulltext_texts">
			<template v-for="page, index in this.$root.params.pages" v-if="page">
				<hr v-if="index && page > 1" class="tify-fulltext_separator">
				<template v-for="text in fulltexts[page]">
					 <div class="tify-fulltext_text" v-html="text"/>
				</template>
			</template>
		</div>
		<div v-else class="tify-fulltext_none">
			{{ 'Fulltext not available for this page'|trans }}
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
			'$root.params.pages': function () {
				this.loadFulltexts();
			},
		},
		methods: {
			loadFulltexts() {
				this.fulltextAvailable = false;
				this.fulltexts = [];

				this.$root.params.pages.forEach((page) => {
					if (page < 1 || this.fulltexts[page]) return;

					const canvas = this.$root.canvases[page - 1];
					if (!('otherContent' in canvas)) return;

					this.$set(this.fulltexts, page, []);

					const annotationListUrl = canvas.otherContent[0]['@id'];
					this.$http.get(annotationListUrl).then((response) => {
						const { resources } = response.data;
						if (!Array.isArray(resources)) return;

						resources.forEach((resource, index) => {
							const res = resource.resource;
							if (res && res.chars) {
								const text = this.$options.filters.filterHtml(res.chars);
								if (text) this.fulltextAvailable = true;
								this.$set(this.fulltexts[page], index, text);
							} else if (res['@id']) {
								this.loadRemoteFulltext(page, index, res['@id']);
							}
						});
					}, (error) => {
						const status = (error.response ? error.response.statusText : error.message);
						this.$root.error = `Error loading other content: ${status}`;
					});
				});
			},
			loadRemoteFulltext(page, index, url) {
				this.$http.get(url).then((response2) => {
					const text = this.$options.filters.filterHtml(response2.data);
					if (text) this.fulltextAvailable = true;
					this.$set(this.fulltexts[page], index, text);
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.$root.error = `Error loading fulltext: ${status}`;
				});
			},
		},
		mounted() {
			this.loadFulltexts();
		},
	};
</script>
