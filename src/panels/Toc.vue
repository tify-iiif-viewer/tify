<template>
	<section class="tify-toc">
		<h2 class="tify-sr-only">{{ 'Table of contents'|trans }}</h2>

		<toc-list
			:canvases="canvases"
			:level="0"
			:page="page"
			:structures="structures"
			@setPage="setPage"
		/>
	</section>
</template>

<script>
	import TocList from '@/components/TocList';

	import scroll from '@/mixins/scroll';

	export default {
		props: [
			'page',
			'canvases',
			'structures',
		],
		mixins: [
			scroll,
		],
		components: {
			TocList,
		},
		methods: {
			setPage(page) {
				this.$emit('setPage', page);
			},
		},
		mounted() {
			this.updateScrollPos('.tify-toc_structure.-current', false);
		},
		updated() {
			this.updateScrollPos('.tify-toc_structure.-current');
		},
	};
</script>
