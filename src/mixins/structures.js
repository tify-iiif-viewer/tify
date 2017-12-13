module.exports = {
	computed: {
		structures() {
			if (!this.$root.manifest.structures) {
				return [];
			}

			const structures = [];
			const structuresThatAreChildren = [];
			const { length } = this.$root.manifest.structures;
			for (let i = 0; i < length; i += 1) {
				const structure = this.$root.manifest.structures[i];

				structure.label = structure.label.trim() || '—'; // NOTE: That's an em dash (&mdash;)

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

				if (structure.within) {
					structuresThatAreChildren.push(structure);
				}

				structures.push(structure);
			}

			const structuresThatAreChildrenLength = structuresThatAreChildren.length;
			for (let i = 0; i < length; i += 1) {
				const childStructures = [];
				for (let j = 0; j < structuresThatAreChildrenLength; j += 1) {
					const childStructure = structuresThatAreChildren[j];
					if (childStructure.within === structures[i]['@id']) {
						childStructures.push(childStructure);
					}
				}
				if (childStructures.length) {
					structures[i].childStructures = childStructures;
				}
			}

			const topLevelStructures = structures.filter(structure => !structure.within);

			return topLevelStructures;
		},
		currentStructure() {
			if (!Array.isArray(this.$root.manifest.structures)) {
				return false;
			}

			const currentCanvasIds = [];
			this.$root.params.pages.forEach((page) => {
				if (page) {
					currentCanvasIds.push(this.$root.canvases[page - 1]['@id']);
				}
			});

			const { length } = this.$root.manifest.structures;
			for (let i = length - 1; i >= 0; i -= 1) {
				const { canvases } = this.$root.manifest.structures[i];
				if (canvases.some(canvasId => currentCanvasIds.indexOf(canvasId) > -1)) {
					return this.$root.manifest.structures[i];
				}
			}
			return false;
		},
		currentStructureMetadata() {
			if (this.currentStructure.metadata && this.currentStructure.metadata.length) {
				return this.currentStructure.metadata;
			}

			return false;
		},
	},
};
