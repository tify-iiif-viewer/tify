<template>
	<section class="tify-toc">
		<h2 class="tify-sr-only">{{ 'Table of Contents'|trans }}</h2>

		<toc-list
			v-if="isInited"
			:level="0"
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
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function () {
				this.$nextTick(() => this.updateScrollPos(currentSelector));
			},
			// eslint-disable-next-line func-names
			'$root.params.view': function () {
				if (this.$root.params.view !== 'toc') return;

				if (!this.isInited) this.isInited = true;

				this.updateScrollPos(currentSelector, false);
			},
		},
		mounted() {
			// TOC is expensive, so render it only when required
			if (this.$root.params.view === 'toc') {
				this.isInited = true;
				this.$nextTick(() => this.updateScrollPos(currentSelector, false));
			}
		},
	};
</script>
