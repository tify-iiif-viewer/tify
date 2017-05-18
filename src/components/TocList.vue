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
				@click="$emit('setPage', structure.firstPage)"
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
				:canvases="canvases"
				:level="level + 1"
				:sectionStructures="structure.childStructures"
				:page="page"
				:parentStructure="structure"
				:structures="structures"
				@setPage="setPage"
			/>
		</li>
	</ul>
</template>

<script>
	export default {
		name: 'toc-list',
		props: [
			'canvases',
			'level',
			'sectionStructures',
			'page',
			'parentStructure',
			'structures',
		],
		data() {
			return {
				workingStructures: [],
			};
		},
		methods: {
			checkIfPageInStructure(structure) {
				return (
					this.page >= structure.firstPage
					&& this.page <= structure.lastPage
				);
			},
			checkIfChildStructuresVisible(structure) {
				if (!structure.childStructures) return false;
				if ('childStructuresVisible' in structure) return structure.childStructuresVisible;
				return this.checkIfPageInStructure(structure);
			},
			setPage(page) {
				this.$emit('setPage', page);
			},
			toggleChildStructures(index) {
				const struct = this.workingStructures[index];
				this.$set(struct, 'childStructuresVisible', !this.checkIfChildStructuresVisible(struct));
			},
		},
		created() {
			const structures = this.sectionStructures || this.structures;

			structures.forEach((structure) => {
				const struct = structure;

				if (
					(!this.parentStructure && !struct.within)
					|| (this.parentStructure && struct.within === this.parentStructure['@id'])
				) {
					struct.pageLabel = this.canvases.find(
						canvas => canvas['@id'] === struct.canvases[0],
					).label;

					struct.firstPage = this.canvases.findIndex(
						canvas => canvas['@id'] === struct.canvases[0],
					) + 1;

					struct.lastPage = this.canvases.findIndex(
						canvas => canvas['@id'] === struct.canvases[struct.canvases.length - 1],
					) + 1;

					const childStructures = [];
					this.structures.forEach((struct2) => {
						if (struct2.within === struct['@id']) childStructures.push(struct2);
					});
					if (childStructures.length) struct.childStructures = childStructures;

					this.workingStructures.push(struct);
				}
			});
		},
	};
</script>
