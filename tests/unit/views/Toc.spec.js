import Vue from 'vue';
import Toc from '@/views/Toc';

import manifestForLabels from '../../iiif-api/data/manifests/bsb00026283.json';
import manifestForPages from '../../iiif-api/data/manifests/gdz-DE_611_BF_5619_1801_1806.json';

describe('Toc', () => {
	it('should select label from multi-lanuage labels', () => {
		const vm = new Vue(Toc);
		vm.$root.iiifConvertToArray = (value) => {
			// NOTE - function will be called on structure.label data,
			// which are (for this manifest) either strings or arrays of objects with 'value' property
			if (Array.isArray(value)) {
				// NOTE - we are testing for english title here (see below)
				return [value.find((thisValue) => thisValue['@language'].indexOf('en') === 0)['@value']];
			}
			return [value];
		};
		vm.$root.manifest = manifestForLabels;
		vm.$root.canvases = manifestForLabels.sequences[0].canvases;

		const { label } = vm.structures[0];
		expect(label).toEqual('Table of Contents');
	});

	it('should be ordered by logical page number', () => {
		const vm = new Vue(Toc);
		vm.$root.iiifConvertToArray = (value) => [value];
		vm.$root.manifest = manifestForPages;
		vm.$root.canvases = manifestForPages.sequences[0].canvases;

		const pages = vm.structures[0].childStructures.map((structure) => structure.firstPage);
		expect(pages.toString()).toEqual(pages.sort((a, b) => a - b).toString());
	});
});
