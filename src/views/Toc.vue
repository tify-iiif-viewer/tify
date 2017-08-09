<template>
	<section class="tify-toc">
		<h2 class="tify-sr-only">{{ 'Table of Contents'|trans }}</h2>

		<div class="tify-toc_header">
			<button class="tify-toc_toggle-all" @click="$refs.children.toggleAllChildren(true)">
				{{ 'Expand all' }}
			</button>
			<button class="tify-toc_toggle-all" @click="$refs.children.toggleAllChildren(false)">
				{{ 'Collapse all' }}
			</button>
		</div>

		<toc-list
			v-if="isInited"
			ref="children"
			:level="0"
			:structures="$root.manifest.structures"
		/>
	</section>
</template>

<script>
	import TocList from '@/components/TocList';

	import scroll from '@/mixins/scroll';

	const currentSelector = '.tify-toc_structure.-current';

	export default {
		mixins: [
			scroll,
		],
		components: {
			TocList,
		},
		data() {
			return {
				isInited: false,
			};
		},
		methods: {
			init() {
				// TOC is expensive, so render it only when required
				if (this.$root.params.view !== 'toc') return;

				this.isInited = true;
				this.$nextTick(() => this.updateScrollPos(currentSelector, false));
			},
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function () {
				this.$nextTick(() => this.updateScrollPos(currentSelector));
			},
			// eslint-disable-next-line func-names
			'$root.params.view': function () {
				this.init();
			},
		},
		mounted() {
			this.init();
		},
	};
</script>
