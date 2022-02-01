<template>
	<section class="tify-toc" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Table of Contents') }}</h2>

		<div v-if="hasChildStructures" class="tify-toc-header">
			<button class="tify-toc-toggle-all" @click="$refs.children.toggleAllChildren(true)">
				{{ $root.translate('Expand all') }}
			</button>
			<button class="tify-toc-toggle-all" @click="$refs.children.toggleAllChildren(false)">
				{{ $root.translate('Collapse all') }}
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
import TocList from './TocList';

import scroll from '../mixins/scroll';
import structures from '../mixins/structures';

const currentSelector = '.tify-toc-structure.-current';

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
			return this.structures.some((structure) => structure.childStructures);
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
		'$root.options.pages': function () {
			this.$nextTick(() => this.updateScrollPos(currentSelector));
		},
		// eslint-disable-next-line func-names
		'$root.options.view': function (view) {
			if (view === 'toc') {
				this.init();
			}
		},
	},
	mounted() {
		// TOC is expensive, so render it only when required
		if (this.$root.options.view === 'toc') {
			this.init();
		}
	},
};
</script>
