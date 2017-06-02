<template>
	<section class="tify-toc">
		<h2 class="tify-sr-only">{{ 'Table of contents'|trans }}</h2>

		<toc-list
			:canvases="$root.canvases"
			:level="0"
			:page="$root.params.page"
			:structures="$root.manifest.structures"
			@setPage="$root.setPage($root.params.page)"
		/>
	</section>
</template>

<script>
	import TocList from '@/components/TocList';

	import scroll from '@/mixins/scroll';

	export default {
		mixins: [
			scroll,
		],
		components: {
			TocList,
		},
		mounted() {
			this.updateScrollPos('.tify-toc_structure.-current', false);
		},
		updated() {
			this.updateScrollPos('.tify-toc_structure.-current');
		},
	};
</script>
