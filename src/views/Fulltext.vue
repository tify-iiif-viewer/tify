<template>
	<section class="tify-fulltext">
		<h2 class="tify-sr-only">{{ 'Fulltext'|trans }}</h2>

		<div v-if="fulltexts.length" class="tify-fulltext_texts">
			<template v-for="text, index in fulltexts">
				<hr v-if="index > 0" class="tify-fulltext_separator">
				<div v-html="text" class="tify-fulltext_text"/>
			</template>
		</div>
		<div v-else class="tify-fulltext_none">
			{{ 'No fulltext available for this page'|trans }}
		</div>
	</section>
</template>

<script>
	export default {
		data() {
			return {
				fulltexts: [],
				loadedFulltexts: {},
			};
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function () {
				this.loadFulltext();
			},
		},
		methods: {
			loadFulltext() {
				this.fulltexts = [];
				this.$root.params.pages.forEach((page) => {
					if (page < 1) return;

					if (this.loadedFulltexts[page]) {
						this.fulltexts.push(this.loadedFulltexts[page]);
						return;
					}

					const canvas = this.$root.canvases[page - 1];
					if (!('otherContent' in canvas)) return;

					const annotationListUrl = canvas.otherContent[0]['@id'];
					this.$http.get(annotationListUrl).then((response) => {
						const fulltextUrl = response.data.resources[0].resource['@id'];
						this.$http.get(fulltextUrl).then((response2) => {
							const fulltext = this.$options.filters.filterHtml(response2.data);
							this.fulltexts.push(fulltext);
							this.loadedFulltexts[page] = fulltext;
						}, (error) => {
							const status = (error.response ? error.response.statusText : error.message);
							this.$root.error = `Error loading fulltext: ${status}`;
						});
					}, (error) => {
						const status = (error.response ? error.response.statusText : error.message);
						this.$root.error = `Error loading other content: ${status}`;
					});
				});
			},
		},
		mounted() {
			this.loadFulltext();
		},
	};
</script>
