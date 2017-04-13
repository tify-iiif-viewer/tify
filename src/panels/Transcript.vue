<template>
	<section class="tify-transcript">
		<h2 class="tify-sr-only">{{ 'Transcript'|trans }}</h2>

		<div v-if="transcript" class="tify-transcript_text" v-html="transcript">
		</div>
		<div v-else class="tify-transcript_none">
			{{ 'No transcript available for this page'|trans }}
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
				transcript: ' ',
			};
		},
		watch: {
			page() {
				this.loadTranscript();
			},
		},
		methods: {
			loadTranscript() {
				const canvas = this.canvases[this.page - 1];

				if (!('otherContent' in canvas)) {
					this.transcript = '';
					return;
				}

				const annotationListUrl = canvas.otherContent[0]['@id'];
				this.$http.get(annotationListUrl).then((response) => {
					const transcriptUrl = response.data.resources[0].resource['@id'];
					this.$http.get(transcriptUrl).then((response2) => {
						this.transcript = this.$options.filters.filterHtml(response2.data);
					}, (error) => {
						const status = (error.response ? error.response.statusText : error.message);
						this.$root.error = `Error loading transcript: ${status}`;
					});
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.$root.error = `Error loading other content: ${status}`;
				});
			},
		},
		mounted() {
			this.loadTranscript();
		},
	};
</script>
