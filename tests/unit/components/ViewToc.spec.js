import Vue from 'vue';
import Toc from '@/components/ViewToc';
import iiif from '@/mixins/iiif';

import manifestForLabels from '../../iiif-api/data/manifests/digitale-sammlungen-bsb00026283.json';
import manifestForPages from '../../iiif-api/data/manifests/gdz-DE_611_BF_5619_1801_1806.json';

Vue.mixin(iiif);

describe('Toc', () => {
	it('selects a label in the current language', () => {
		const vm = new Vue(Toc);

		vm.$root.options = { language: 'en' };
		vm.$root.manifest = manifestForLabels;
		vm.$root.canvases = manifestForLabels.sequences[0].canvases;

		const { label } = vm.structures[0];
		expect(label).toEqual('Table of Contents');
	});

	it('orders pages by logical page number', () => {
		const vm = new Vue(Toc);

		vm.$root.manifest = manifestForPages;
		vm.$root.canvases = manifestForPages.sequences[0].canvases;

		const pages = vm.structures[0].childStructures.map((structure) => structure.firstPage);
		expect(pages.toString()).toEqual(pages.sort((a, b) => a - b).toString());
	});
});
