import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import Toc from '../../../src/components/ViewToc.vue';

import { options, setManifest } from '../../../src/modules/store';

import manifestForLabels from '../../iiif-api/data/manifests/digitale-sammlungen-bsb00026283.json';
import manifestForPages from '../../iiif-api/data/manifests/gdz-DE_611_BF_5619_1801_1806.json';

options.language = 'en';

describe('Toc', () => {
	it('selects a label in the current language', () => {
		setManifest(manifestForLabels);

		const { vm } = mount(Toc);

		const { label } = vm.structures[0];
		expect(label).toEqual('Miniatur: Jesu Gebet in Gethsemane');
	});

	it('orders pages by logical page number', () => {
		setManifest(manifestForPages);

		const { vm } = mount(Toc);

		const pages = vm.structures[0].childStructures.map((structure) => structure.firstPage);
		expect(pages.toString()).toEqual(pages.sort((a, b) => a - b).toString());
	});
});
