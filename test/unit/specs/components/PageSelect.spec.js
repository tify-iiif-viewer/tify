import Vue from 'vue';
import PageSelect from '@/components/PageSelect';

import manifest from '../../fixtures/manifest.json';

describe('PageSelect', () => {
	const vm = new Vue(PageSelect);
	vm.$root.canvases = manifest.sequences[0].canvases;
	vm.$root.params = { page: 1 };

	it('should filter and update canvases', () => {
		vm.filter = '5';
		vm.updateFilteredCanvases();

		expect(vm.highlightIndex).to.equal(0);
		expect(vm.filteredCanvases.length).to.equal(4); // Should contain pages 5, 15, 25, 35
	});
});
