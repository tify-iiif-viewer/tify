<template>
	<section class="tify-transcript">
		<h2 class="tify-sr-only">{{ 'Transcript'|trans }}</h2>

		<div class="tify-transcript_page">
			{{ fulltext }}
		</div>
	</section>
</template>

<script>
	export default {
		props: [
			'fulltext',
		],
	};
</script>
