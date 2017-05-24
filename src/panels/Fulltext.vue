<template>
	<section class="tify-fulltext">
		<h2 class="tify-sr-only">{{ 'Fulltext'|trans }}</h2>

		<div v-if="fulltext" class="tify-fulltext_text" v-html="fulltext">
		</div>
		<div v-else class="tify-fulltext_none">
			{{ 'No fulltext available for this page'|trans }}
		</div>
	</section>
</template>

<script>
	export default {
		props: [
			'canvases',
			'page',
		],
		data() {
			return {
				fulltext: ' ',
			};
		},
		watch: {
			page() {
				this.loadFulltext();
			},
		},
		methods: {
			loadFulltext() {
				const canvas = this.canvases[this.page - 1];

				if (!('otherContent' in canvas)) {
					this.fulltext = '';
					return;
				}

				const annotationListUrl = canvas.otherContent[0]['@id'];
				this.$http.get(annotationListUrl).then((response) => {
					const fulltextUrl = response.data.resources[0].resource['@id'];
					this.$http.get(fulltextUrl).then((response2) => {
						this.fulltext = this.$options.filters.filterHtml(response2.data);
					}, (error) => {
						const status = (error.response ? error.response.statusText : error.message);
						this.$root.error = `Error loading fulltext: ${status}`;
					});
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.$root.error = `Error loading other content: ${status}`;
				});
			},
		},
		mounted() {
			this.loadFulltext();
		},
	};
</script>
