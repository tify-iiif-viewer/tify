<template>
	<ul class="tify-toc_list">
		<li
			v-for="(structure, index) in structures"
			class="tify-toc_structure"
			:data-level="level"
			:class="{
				'-current': checkIfPagesInStructure(structure),
				'-expanded': expandedStructures[index],
			}"
			:key="index"
		>
			<button
				v-if="structure.childStructures"
				class="tify-toc_toggle"
				:title="$options.filters.trans(expandedStructures[index] ? 'Collapse' : 'Expand')"
				@click="toggleChildren(index)"
			>
				<template v-if="expandedStructures[index]">
					<icon name="remove"/>
					<span class="tify-sr-only">{{ 'Collapse'|trans }}</span>
				</template>
				<template v-else>
					<icon name="add"/>
					<span class="tify-sr-only">{{ 'Expand'|trans }}</span>
				</template>
			</button>

			<a
				v-if="purpose === 'pdf'"
				class="tify-toc_link"
				download
				:href="getLabels(structure.rendering)[0]['@id']"
			>
				<i class="tify-badge">PDF</i>
				{{ structure.label }}
				({{ structure.pageCount }}&nbsp;{{ (structure.pageCount === 1 ? 'page' : 'pages')|trans }})
			</a>
			<a
				v-else
				class="tify-toc_link -dots"
				@click="setPage(structure.firstPage)"
			>
				<span class="tify-toc_label">{{ structure.label }}</span>
				<span class="tify-toc_page">{{ structure.pageLabel }}</span>
			</a>

			<toc-list
				v-if="structure.childStructures"
				v-show="expandedStructures[index]"
				ref="children"
				:level="level + 1"
				:parentStructure="structure"
				:purpose="purpose"
				:structures="structure.childStructures"
			/>
		</li>
	</ul>
</template>

<script>
export default {
	name: 'toc-list',
	props: [
		'level',
		'structures',
		'parentStructure',
		'purpose',
	],
	data() {
		return {
			expandedStructures: [],
		};
	},
	methods: {
		checkIfPagesInStructure(structure) {
			const { pages } = this.$root.params;
			return pages.some((page) => page >= structure.firstPage && page <= structure.lastPage);
		},
		setPage(page) {
			this.$root.setPage(page);
			if (this.$root.isMobile()) {
				this.$root.updateParams({ view: 'scan' });
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

			const doExpand = (expanded !== null ? expanded : !this.expandedStructures[index]);
			if (doExpand) {
				this.$set(this.expandedStructures, index, true);
			} else {
				this.$set(this.expandedStructures, index, false);
			}
		},
		getLabels(value) {
			return this.$root.convertValueToArray(value);
		},
	},
};
</script>
