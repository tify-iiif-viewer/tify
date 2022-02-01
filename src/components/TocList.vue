<template>
	<ul class="tify-toc-list">
		<li
			v-for="(structure, index) in structures"
			class="tify-toc-structure"
			:data-level="level"
			:class="{
				'-current': checkIfPagesInStructure(structure),
				'-expanded': expandedStructures[index],
			}"
			:key="index"
		>
			<button
				v-if="structure.childStructures"
				class="tify-toc-toggle"
				:title="$root.translate(expandedStructures[index] ? 'Collapse' : 'Expand')"
				:aria-controls="`${id}-${index}`"
				:aria-expanded="expandedStructures[index] ? 'true' : 'false'"
				@click="toggleChildren(index)"
			>
				<template v-if="expandedStructures[index]">
					<icon-minus/>
				</template>
				<template v-else>
					<icon-plus/>
				</template>
			</button>

			<a
				v-if="purpose === 'pdf'"
				class="tify-toc-link"
				download
				:href="$root.convertValueToArray(structure.rendering)[0]['@id']"
			>
				{{ structure.label }}
				({{ structure.pageCount }}&nbsp;{{ $root.translate(structure.pageCount === 1 ? 'page' : 'pages') }})
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
			id: this.$root.getId(`toc-list-${Math.floor(Math.random() * 1e12)}`),
		};
	},
	methods: {
		checkIfPagesInStructure(structure) {
			const { pages } = this.$root.options;
			return pages.some((page) => page >= structure.firstPage && page <= structure.lastPage);
		},
		setPage(page) {
			this.$root.setPage(page);
			if (this.$root.isMobile()) {
				this.$root.updateOptions({ view: 'scan' });
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
	},
};
</script>
