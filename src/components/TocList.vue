<template>
	<ul class="tify-toc_list">
		<li
			v-for="structure, index in workingStructures"
			class="tify-toc_structure"
			:data-level="level"
			:class="{
				'-current': checkIfPageInStructure(structure),
				'-children-visible': checkIfChildStructuresVisible(structure),
			}"
		>
			<button
				v-if="structure.childStructures"
				class="tify-toc_toggle"
				@click="toggleChildStructures(index)"
			>
				<template v-if="checkIfChildStructuresVisible(structure)">
					<i class="tify-icon">remove</i>
					<span class="tify-sr-only">Hide children</span>
				</template>
				<template v-else>
					<i class="tify-icon">add</i>
					<span class="tify-sr-only">Show children</span>
				</template>
			</button>

			<a
				class="tify-toc_link"
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
				v-show="checkIfChildStructuresVisible(structure)"
				:level="level + 1"
				:parentStructure="structure"
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
		],
		data() {
			return {
				workingStructures: [],
			};
		},
		methods: {
			checkIfPageInStructure(structure) {
				const pages = this.$root.params.pages;
				const length = pages.length;
				for (let i = 0; i < length; i += 1) {
					if (pages[i] >= structure.firstPage && pages[i] <= structure.lastPage) {
						return true;
					}
				}
				return false;
			},
			checkIfChildStructuresVisible(structure) {
				if (!structure.childStructures) return false;
				if ('childStructuresVisible' in structure) return structure.childStructuresVisible;
				return this.checkIfPageInStructure(structure);
			},
			setPage(page) {
				this.$root.setPage(page);
				if (this.$root.isMobile()) this.$root.updateParams({ view: 'scan' });
			},
			toggleChildStructures(index) {
				const struct = this.workingStructures[index];
				this.$set(struct, 'childStructuresVisible', !this.checkIfChildStructuresVisible(struct));
			},
		},
		created() {
			// Child instances are using the prop, while the top-most ancestor uses the manifest
			const structures = this.structures || this.$root.manifest.structures;

			structures.forEach((structure) => {
				const struct = structure;

				if (
					(!this.parentStructure && !struct.within)
					|| (this.parentStructure && struct.within === this.parentStructure['@id'])
				) {
					if (struct.canvases) {
						struct.firstPage = this.$root.canvases.findIndex(
							canvas => canvas['@id'] === struct.canvases[0],
						) + 1;

						struct.lastPage = this.$root.canvases.findIndex(
							canvas => canvas['@id'] === struct.canvases[struct.canvases.length - 1],
						) + 1;

						struct.pageLabel = this.$root.canvases[struct.firstPage - 1].label;
					} else {
						struct.firstPage = 1;
						struct.lastPage = this.$root.pageCount;
						struct.pageLabel = this.$root.canvases[0].label;
					}

					const childStructures = [];
					this.$root.manifest.structures.forEach((struct2) => {
						if (struct2.within === struct['@id']) childStructures.push(struct2);
					});
					if (childStructures.length) struct.childStructures = childStructures;

					this.workingStructures.push(struct);
				}
			});
		},
	};
</script>
