<template>
	<section class="tify-toc">
		<h2 class="tify-sr-only">{{ 'Table of contents'|trans }}</h2>

		<ul class="tify-toc_list">
			<toc-item
				v-for="item, index in structures"
				:canvases="canvases"
				:key="index"
				:item="item"
				:page="page"
				@setPage="setPage"
			/>
		</ul>
	</section>
</template>

<script>
	import TocItem from '@/components/TocItem';

	export default {
		props: [
			'page',
			'canvases',
			'structures',
		],
		components: {
			TocItem,
		},
		methods: {
			setPage(page) {
				this.$emit('setPage', page);
			},
		},
	};
</script>
