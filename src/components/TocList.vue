<script>
import { useId } from 'vue';

export default {
	name: 'TocList',
	props: {
		level: {
			type: Number,
			default: 0,
		},
		structures: {
			type: Array,
			default: () => [],
		},
		purpose: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			// Auto-expand a single top-level structure with children
			expandedStructures: this.level === 0
				&& this.structures.length === 1
				&& this.structures[0].items?.some((item) => item.items)
				? [true]
				: [],
		};
	},
	computed: {
		id() {
			return this.$getId(useId());
		},
	},
	methods: {
		// TODO: Add unit test
		getFirstPage(structure) {
			if (structure.items) {
				return this.getFirstPage(structure.items[0]);
			}

			const index = this.$store.manifest.items.findIndex((item) => item.id === structure.id);
			return index < 0 ? 1 : index + 1;
		},
		getFirstPageLabel(structure) {
			const firstPage = this.getFirstPage(structure);
			return this.$store.localize(this.$store.manifest.items[firstPage - 1]?.label);
		},
		// TODO: Add unit test
		getLastPage(structure) {
			if (structure.items) {
				return this.getLastPage(structure.items.at(-1));
			}

			const index = this.$store.manifest.items.findLastIndex((item) => item.id === structure.id);
			return index < 0 ? this.$store.manifest.items.length : index + 1;
		},
		// TODO: Add unit test
		isCurrentPageInStructure(structure) {
			const currentCanvasIds = this.$store.manifest.items
				.filter((item, index) => this.$store.options.pages.includes(index + 1))
				.map((canvas) => canvas.id);

			if (currentCanvasIds.some((id) => structure.items?.some((item) => item.id === id))) {
				return true;
			}

			const firstPage = structure.firstPage || this.getFirstPage(structure);
			const lastPage = structure.lastPage || this.getLastPage(structure);

			return this.$store.options.pages.some((page) => page >= firstPage && page <= lastPage);
		},
		setPage(page) {
			this.$store.setPage(page);

			if (!this.$store.isContainerWidthAtLeast('medium')) {
				this.$store.updateOptions({ view: null });
			}
		},
		toggleAllChildren(expanded = null) {
			if (!this.$refs.children) {
				return;
			}

			for (let i = this.structures.length - 1; i >= 0; i -= 1) {
				this.toggleChildren(i, expanded);
			}

			this.$refs.children.forEach((child) => {
				child.toggleAllChildren(expanded);
			});
		},
		toggleChildren(index, expanded = null) {
			const structure = this.structures[index];
			if (!structure.items?.some((item) => item.items)) {
				return;
			}

			this.expandedStructures[index] = expanded !== null ? expanded : !this.expandedStructures[index];
		},
	},
};
</script>

<template>
	<ul class="tify-toc-list">
		<li
			v-for="(structure, index) in structures"
			:key="index"
			class="tify-toc-structure"
			:class="{
				'-current': isCurrentPageInStructure(structure),
				'-expanded': expandedStructures[index],
			}"
		>
			<button
				v-if="structure.items?.some((item) => item.items)"
				type="button"
				class="tify-toc-toggle"
				:aria-controls="`${id}-${index}`"
				:aria-expanded="!!expandedStructures[index]"
				:aria-label="$translate(expandedStructures[index] ? 'Collapse' : 'Expand')"
				:title="$translate(expandedStructures[index] ? 'Collapse' : 'Expand')"
				@click="toggleChildren(index)"
			>
				<template v-if="expandedStructures[index]">
					<IconMinus />
				</template>
				<template v-else>
					<IconPlus />
				</template>
			</button>

			<a
				v-if="purpose === 'pdf'"
				class="tify-toc-link"
				:href="structure.rendering[0].id"
				download
			>
				{{ $store.localize(structure.label) }}
				({{ structure.items.length }}&nbsp;{{ $translate(structure.items.length === 1 ? 'page' : 'pages') }})
			</a>
			<!-- Only display page label if structure has a different label -->
			<a
				v-else-if="structure.label && $store.localize(structure.label) !== getFirstPageLabel(structure)"
				class="tify-toc-link -dots"
				href="javascript:;"
				@click="setPage(structure.firstPage || getFirstPage(structure))"
			>
				<span class="tify-toc-label">
					{{ $store.localize(structure.label) }}
				</span>
				<span class="tify-toc-page">
					{{ getFirstPageLabel(structure) || '—' }}
				</span>
			</a>
			<a
				v-else
				class="tify-toc-link"
				href="javascript:;"
				@click="setPage(structure.firstPage || getFirstPage(structure))"
			>
				<span class="tify-toc-label">
					{{ $store.localize(structure.label, 'string')
						|| getFirstPageLabel(structure)
						|| $translate('$n/a')
					}}
				</span>
			</a>

			<TocList
				v-if="structure.items?.some((item) => item.items)"
				v-show="expandedStructures[index]"
				:id="`${id}-${index}`"
				ref="children"
				:level="level + 1"
				:purpose="purpose"
				:structures="structure.items"
			/>
		</li>
	</ul>
</template>
