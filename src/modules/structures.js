import { computed } from 'vue';

import { convertValueToArray } from './iiif';
import { manifest, options, pageCount } from './store';

export const currentStructure = computed(() => {
	if (!manifest || !Array.isArray(manifest.structures)) {
		return false;
	}

	const currentCanvasIds = [];
	options.pages.forEach((page) => {
		if (page) {
			currentCanvasIds.push(manifest.sequences[0].canvases[page - 1]['@id']);
		}
	});

	const { length } = manifest.structures;
	let indexOfStructureWithSmallestRange;
	let smallestRange;
	for (let i = 0; i < length; i += 1) {
		const structure = manifest.structures[i];
		const { canvases } = structure;
		if (canvases && canvases.some((canvasId) => currentCanvasIds.indexOf(canvasId) > -1)) {
			if (structure.firstPage && structure.lastPage) {
				const currentRange = structure.lastPage - structure.firstPage;
				if (currentRange < smallestRange || !smallestRange) {
					indexOfStructureWithSmallestRange = i;
					smallestRange = currentRange;
					if (smallestRange === 0) {
						break;
					}
				}
			}
		}
	}

	if (typeof indexOfStructureWithSmallestRange === 'number'
		&& indexOfStructureWithSmallestRange >= 0
	) {
		return manifest.structures[indexOfStructureWithSmallestRange];
	}

	return false;
});

export const currentStructureLabel = computed(() => {
	const { label } = currentStructure.value;
	return label;
});

export const currentStructureMetadata = computed(() => {
	const { metadata } = currentStructure.value;
	return metadata;
});

export const structures = computed(() => {
	if (!manifest.structures) {
		return [];
	}

	const mappedStructures = [];
	const structuresThatAreChildren = [];
	const { canvases } = manifest.sequences[0];
	const { length } = manifest.structures;
	for (let i = 0; i < length; i += 1) {
		const structure = manifest.structures[i];

		// https://iiif.io/api/presentation/2.1/#viewinghint
		if (structure.viewingHint === 'top') {
			continue;
		}

		if (structure.label) {
			structure.label = convertValueToArray(structure.label)[0].trim();
		} else {
			structure.label = '—'; // NOTE: That's an em dash (&mdash;)
		}

		if (structure.canvases) {
			const firstCanvas = structure.canvases[0];
			structure.firstPage = canvases.findIndex((canvas) => canvas['@id'] === firstCanvas) + 1;

			const lastCanvas = structure.canvases[structure.canvases.length - 1];
			structure.lastPage = canvases.findIndex((canvas) => canvas['@id'] === lastCanvas) + 1;

			const firstPageCanvas = canvases[structure.firstPage - 1];
			if (!firstPageCanvas) {
				// Excluding structure if its range has no canvases
				continue;
			}

			structure.pageLabel = firstPageCanvas.label;
		} else if (canvases[0]) {
			structure.firstPage = 1;
			structure.lastPage = pageCount.value;
			structure.pageLabel = canvases[0].label;
		}

		structure.pageCount = structure.lastPage - structure.firstPage + 1;

		if (structure.within) {
			structuresThatAreChildren.push(structure);
		}

		mappedStructures.push(structure);
	}

	const structuresThatAreChildrenLength = structuresThatAreChildren.length;
	for (let i = 0; i < length; i += 1) {
		const childStructures = [];
		for (let j = 0; j < structuresThatAreChildrenLength; j += 1) {
			const childStructure = structuresThatAreChildren[j];
			if (childStructure.within === mappedStructures[i]['@id']) {
				childStructures.push(childStructure);
			}
		}

		if (childStructures.length) {
			mappedStructures[i].childStructures = childStructures.sort((a, b) => a.firstPage - b.firstPage);
		}
	}

	const topLevelStructures = mappedStructures
		.filter((structure) => !structure.within)
		.sort((a, b) => a.firstPage - b.firstPage);

	return topLevelStructures;
});
