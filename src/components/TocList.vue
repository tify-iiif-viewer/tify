<template>
	<ul class="tify-toc-list">
		<li
			v-for="(structure, index) in structures"
			:key="index"
			class="tify-toc-structure"
			:data-level="level"
			:class="{
				'-current': checkIfPagesInStructure(structure),
				'-expanded': expandedStructures[index],
			}"
		>
			<button
				v-if="structure.childStructures"
				type="button"
				class="tify-toc-toggle"
				:title="translate(expandedStructures[index] ? 'Collapse' : 'Expand')"
				:aria-controls="`${id}-${index}`"
				:aria-expanded="expandedStructures[index] ? 'true' : 'false'"
				@click="toggleChildren(index)"
			>
				<template v-if="expandedStructures[index]">
					<icon-minus />
				</template>
				<template v-else>
					<icon-plus />
				</template>
			</button>

			<a
				v-if="purpose === 'pdf'"
				class="tify-toc-link"
				download
				:href="convertValueToArray(structure.rendering)[0]['@id']"
			>
				{{ structure.label }}
				({{ structure.pageCount }}&nbsp;{{ translate(structure.pageCount === 1 ? 'page' : 'pages') }})
			</a>
			<a
				v-else
				class="tify-toc-link -dots"
				href="javascript:;"
				@click="setPage(structure.firstPage)"
			>
				<span class="tify-toc-label">{{ structure.label }}</span>
				<span class="tify-toc-page">{{ structure.pageLabel }}</span>
			</a>

			<toc-list
				v-if="structure.childStructures"
				v-show="expandedStructures[index]"
				:id="`${id}-${index}`"
				ref="children"
				:level="level + 1"
				:parent-structure="structure"
				:purpose="purpose"
				:structures="structure.childStructures"
			/>
		</li>
	</ul>
</template>

<script>
import { getId } from '../modules/id';
import { translate } from '../modules/i18n';
import { convertValueToArray } from '../modules/iiif';
import { setPage } from '../modules/pagination';
import { isMobile } from '../modules/ui';
import { options, updateOptions } from '../modules/store';

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
		parentStructure: {
			type: Object,
			default: () => {},
		},
		purpose: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			expandedStructures: [],
			id: getId(`toc-list-${Math.floor(Math.random() * 1e12)}`),
		};
	},
	methods: {
		checkIfPagesInStructure(structure) {
			const { pages } = options;
			return pages.some((page) => page >= structure.firstPage && page <= structure.lastPage);
		},
		convertValueToArray,
		setPage(page) {
			setPage(page);
			if (isMobile()) {
				updateOptions({ view: 'scan' });
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
			if (!structure.childStructures) {
				return;
			}

			this.expandedStructures[index] = expanded !== null ? expanded : !this.expandedStructures[index];
		},
		translate,
	},
};
</script>
