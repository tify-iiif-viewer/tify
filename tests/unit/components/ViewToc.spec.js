import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import ViewToc from '../../../src/components/ViewToc.vue';

import i18n from '../../../src/plugins/i18n';
import store from '../../../src/plugins/store';

import manifestForLabels from '../../iiif-api/data/manifests/digitale-sammlungen-bsb00026283.json';
import manifestForPages from '../../iiif-api/data/manifests/gdz-DE_611_BF_5619_1801_1806.json';

describe('ViewToc', () => {
	const { vm } = mount(ViewToc, {
		global: {
			plugins: [
				i18n,
				[store, {
					options: { language: 'en' },
					manifest: manifestForLabels,
				}],
			],
		},
	});

	it('selects a label in the current language', () => {
		const label = vm.$store.localize(vm.$store.structures[0].label);
		expect(label).toEqual('Miniatur: Jesu Gebet in Gethsemane');
	});

	it('orders pages by logical page number', () => {
		vm.$store.manifest = manifestForPages;

		const pages = vm.$store.structures[0].canvases.map((structure) => structure.firstPage);
		expect(pages.toString()).toEqual(pages.sort((a, b) => a - b).toString());
	});
});
