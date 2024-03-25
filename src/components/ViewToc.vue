<template>
	<section
		class="tify-toc"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Table of Contents') }}
		</h2>

		<div
			v-if="hasChildStructures"
			class="tify-toc-header"
		>
			<button
				type="button"
				class="tify-toc-toggle-all"
				@click="$refs.children.toggleAllChildren(true)"
			>
				{{ $translate('Expand all') }}
			</button>
			<button
				type="button"
				class="tify-toc-toggle-all"
				@click="$refs.children.toggleAllChildren(false)"
			>
				{{ $translate('Collapse all') }}
			</button>
		</div>

		<toc-list
			v-if="isInited"
			ref="children"
			:level="0"
			:structures="tocStructures"
		/>
	</section>
</template>

<script>
import { updateScrollPos } from '../modules/scroll';

const currentSelector = '.tify-toc-structure.-current';

export default {
	data() {
		return {
			isInited: false,
		};
	},
	computed: {
		hasChildStructures() {
			return this.$store.structures?.some((structure) => structure.items?.length > 1);
		},
		tocStructures() {
			return this.$store.structures.filter((structure) => !structure.behavior?.includes('top'));
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.pages': function () {
			this.$nextTick(() => updateScrollPos(currentSelector, this.$el));
		},
		'$store.options.view': {
			handler(view) {
				if (view === 'toc') {
					this.$nextTick(this.init);
				}
			},
			immediate: true,
		},
	},
	methods: {
		init() {
			this.isInited = true;
			this.$nextTick(() => updateScrollPos(currentSelector, this.$el, false));
		},
	},
};
</script>
