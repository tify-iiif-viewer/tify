import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import PageSelect from '../../../src/components/PageSelect.vue';

import { options, setManifest } from '../../../src/modules/store';

import manifest from '../../iiif-api/data/manifests/gdz-PPN857449303.json';

options.language = 'en';
options.pages = [1];
options.pageLabelFormat = 'P : L';
options.root = {
	$el: {
		addEventListener() {},
	},
};

setManifest(manifest);

describe('PageSelect', () => {
	const { vm } = mount(PageSelect);

	it('filters and updates canvases', () => {
		vm.filter = '5';
		vm.updateFilteredCanvases();

		expect(vm.highlightIndex).toEqual(0);
		expect(vm.filteredCanvases.length).toEqual(4); // Should contain pages 5, 15, 25, 35
	});
});
