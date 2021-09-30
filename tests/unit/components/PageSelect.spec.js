import Vue from 'vue';
import PageSelect from '@/components/PageSelect';

import manifest from '../../iiif-api/data/manifests/gdz-PPN857449303.json';

describe('PageSelect', () => {
	const vm = new Vue(PageSelect);
	vm.$root.manifest = manifest;
	vm.$root.canvases = manifest.sequences[0].canvases;
	vm.$root.options = { pages: [1] };

	vm.$root.convertValueToArray = (value) => [value];

	it('should filter and update canvases', () => {
		vm.filter = '5';
		vm.updateFilteredCanvases();

		expect(vm.highlightIndex).toEqual(0);
		expect(vm.filteredCanvases.length).toEqual(4); // Should contain pages 5, 15, 25, 35
	});
});
