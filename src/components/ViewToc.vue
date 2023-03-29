<template>
	<section
		class="tify-toc"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ translate('Table of Contents') }}
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
				{{ translate('Expand all') }}
			</button>
			<button
				type="button"
				class="tify-toc-toggle-all"
				@click="$refs.children.toggleAllChildren(false)"
			>
				{{ translate('Collapse all') }}
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
import { translate } from '../modules/i18n';
import { options } from '../modules/store';
import { structures } from '../modules/structures';
import { updateScrollPos } from '../modules/ui';

const currentSelector = '.tify-toc-structure.-current';

export default {
	data() {
		return {
			isInited: false,
			options, // required for watcher
			structures,
		};
	},
	computed: {
		hasChildStructures() {
			return structures.value && structures.value.some((structure) => structure.childStructures);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'options.pages': function () {
			this.$nextTick(() => updateScrollPos(currentSelector, this.$el));
		},
		// eslint-disable-next-line func-names
		'options.view': {
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
		translate,
	},
};
</script>
