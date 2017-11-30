<template>
	<section class="tify-toc">
		<h2 class="tify-sr-only">{{ 'Table of Contents'|trans }}</h2>

		<div v-if="hasChildStructures" class="tify-toc_header">
			<button class="tify-toc_toggle-all" @click="$refs.children.toggleAllChildren(true)">
				{{ 'Expand all'|trans }}
			</button>
			<button class="tify-toc_toggle-all" @click="$refs.children.toggleAllChildren(false)">
				{{ 'Collapse all'|trans }}
			</button>
		</div>

		<toc-list
			v-if="isInited"
			ref="children"
			:level="0"
			:structures="structures"
		/>
	</section>
</template>

<script>
	import TocList from '@/components/TocList';

	import scroll from '@/mixins/scroll';
	import structures from '@/mixins/structures';

	const currentSelector = '.tify-toc_structure.-current';

	export default {
		mixins: [
			scroll,
			structures,
		],
		components: {
			TocList,
		},
		data() {
			return {
				isInited: false,
			};
		},
		computed: {
			hasChildStructures() {
				return this.structures.some(structure => structure.childStructures);
			},
		},
		methods: {
			init() {
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
			'$root.params.view': function (view) {
				if (view === 'toc') this.init();
			},
		},
		mounted() {
			// TOC is expensive, so render it only when required
			if (this.$root.params.view === 'toc') this.init();
		},
	};
</script>
