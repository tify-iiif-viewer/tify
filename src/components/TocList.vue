<template>
	<ul class="tify-toc_list">
		<li
			v-for="structure, index in workingStructures"
			class="tify-toc_structure"
			:data-level="level"
			:class="{
				'-current': structure.current,
				'-expanded': structure.expanded,
			}"
		>
			<button
				v-if="structure.childStructures"
				class="tify-toc_toggle"
				:title="$options.filters.trans(structure.expanded ? 'Collapse' : 'Expand')"
				@click="toggleChildren(index)"
			>
				<template v-if="structure.expanded">
					<i class="tify-icon">remove</i>
					<span class="tify-sr-only">{{ 'Collapse'|trans }}</span>
				</template>
				<template v-else>
					<i class="tify-icon">add</i>
					<span class="tify-sr-only">{{ 'Expand'|trans }}</span>
				</template>
			</button>

			<a
				v-if="purpose === 'pdf'"
				class="tify-toc_link"
				download
				:href="$root.iiifConvertToArray(structure.rendering)[0]['@id']"
			>
				<i class="tify-badge">
					PDF
				</i>
				<template v-if="structure.label.trim()">
					{{ structure.label }}
				</template>
				<template v-else>
					&mdash;
				</template>
				({{ structure.pageCount }}&nbsp;{{ (structure.pageCount === 1 ? 'page' : 'pages')|trans }})
			</a>
			<a
				v-else
				class="tify-toc_link -dots"
				@click="setPage(structure.firstPage)"
			>
				<span class="tify-toc_chapter">
					<template v-if="structure.label.trim()">
						{{ structure.label }}
					</template>
					<template v-else>
						&mdash;
					</template>
				</span>
				<span class="tify-toc_page-number">
					{{ structure.pageLabel }}
				</span>
			</a>

			<toc-list
				v-if="structure.childStructures"
				v-show="structure.expanded"
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
				workingStructures: [],
			};
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function () {
				if (!this.structures) return;

				const structuresLength = this.workingStructures.length;
				for (let i = 0; i < structuresLength; i += 1) {
					const structure = this.workingStructures[i];

					if (this.checkIfPagesInStructure(structure)) {
						structure.current = true;
						if (structure.childStructures) structure.expanded = true;
					} else {
						structure.current = false;
						structure.expanded = false;
					}

					this.$set(this.workingStructures, i, structure);
				}
			},
		},
		methods: {
			checkIfPagesInStructure(structure, pages = this.$root.params.pages) {
				for (let i = 0; i < pages.length; i += 1) {
					if (pages[i] >= structure.firstPage && pages[i] <= structure.lastPage) {
						return true;
					}
				}
				return false;
			},
			setPage(page) {
				this.$root.setPage(page);
				if (this.$root.isMobile()) this.$root.updateParams({ view: 'scan' });
			},
			toggleAllChildren(expanded = null) {
				if (!this.$refs.children) return;

				const structuresLength = this.workingStructures.length;
				for (let i = 0; i < structuresLength; i += 1) {
					this.toggleChildren(i, expanded);
				}

				this.$refs.children.forEach((child) => {
					child.toggleAllChildren(expanded);
				});
			},
			toggleChildren(index, expanded = null) {
				const structure = this.workingStructures[index];
				if (!structure.childStructures) return;

				structure.expanded = (expanded !== null ? expanded : !structure.expanded);
				this.$set(this.workingStructures, index, structure);
			},
		},
		created() {
			for (let i = 0; i < this.structures.length; i += 1) {
				const structure = this.structures[i];

				if (
					(!this.parentStructure && !structure.within)
					|| (this.parentStructure && structure.within === this.parentStructure['@id'])
				) {
					if (structure.canvases) {
						const firstCanvas = structure.canvases[0];
						structure.firstPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === firstCanvas) + 1;

						const lastCanvas = structure.canvases[structure.canvases.length - 1];
						structure.lastPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === lastCanvas) + 1;

						structure.pageLabel = this.$root.canvases[structure.firstPage - 1].label;
					} else {
						structure.firstPage = 1;
						structure.lastPage = this.$root.pageCount;
						structure.pageLabel = this.$root.canvases[0].label;
					}

					structure.pageCount = (structure.lastPage - structure.firstPage) + 1;
					structure.current = this.checkIfPagesInStructure(structure);

					const childStructures = [];
					for (let j = 0; j < this.$root.manifest.structures.length; j += 1) {
						const structure2 = this.$root.manifest.structures[j];
						if (structure2.within === structure['@id']) {
							childStructures.push(structure2);
						}
					}

					if (childStructures.length) {
						structure.childStructures = childStructures;
						structure.expanded = structure.current;
					} else {
						structure.expanded = false;
					}

					this.workingStructures.push(structure);
				}
			}
		},
	};
</script>
