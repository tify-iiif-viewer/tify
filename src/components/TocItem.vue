<!--
TODO: Add support for nested TOCs
-->

<template>
	<li class="tify-toc_item" :class="{ '-current': current }">
		<a
			class="tify-toc_link"
			:class="{ '-current': current }"
			@click="$emit('setPage', firstPage)"
		>
			<span class="tify-toc_chapter">
				<template v-if="item.label.trim()">
					{{ item.label }}
				</template>
				<template v-else>
					&mdash;
				</template>
			</span>
			<span class="tify-toc_page-number">
				{{ pageLabel }}
			</span>
		</a>
	</li>
</template>

<script>
	export default {
		props: [
			'canvases',
			'item',
			'page',
		],
		computed: {
			// TODO: This is slow, write page ranges to structured and send prepared object
			current() {
				return (this.page >= this.firstPage && this.page <= this.lastPage);
			},
			pageLabel() {
				return this.canvases.find(
					el => el['@id'] === this.item.canvases[0],
				).label;
			},
			firstPage() {
				return this.canvases.findIndex(
					el => el['@id'] === this.item.canvases[0],
				) + 1;
			},
			lastPage() {
				return this.canvases.findIndex(
					el => el['@id'] === this.item.canvases[this.item.canvases.length - 1],
				) + 1;
			},
		},
	};
</script>
