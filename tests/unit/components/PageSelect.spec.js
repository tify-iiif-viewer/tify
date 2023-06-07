import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import PageSelect from '../../../src/components/PageSelect.vue';

import i18n from '../../../src/plugins/i18n';
import store from '../../../src/plugins/store';

import manifest from '../../iiif-api/data/manifests/gdz-PPN857449303.json';

describe('PageSelect', () => {
	const { vm } = mount(PageSelect, {
		global: {
			plugins: [
				i18n,
				[store, {
					manifest,
					options: {
						language: 'en',
						pageLabelFormat: 'P : L',
						pages: [1],
					},
					rootElement: { addEventListener() {} },
				}],
			],
		},
	});

	it('filters and updates canvases', () => {
		vm.filter = '5';
		vm.updateFilteredCanvases();

		expect(vm.highlightIndex).toEqual(0);
		expect(vm.filteredCanvases.length).toEqual(4); // Should contain pages 5, 15, 25, 35
	});
});
