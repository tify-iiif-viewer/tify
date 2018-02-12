import Vue from 'vue';
import Toc from '@/views/Toc';

import manifest from '../../../iiif-api/data/manifests/bsb00026283.json';

describe('Toc', () => {
	const vm = new Vue(Toc);
	vm.$root.manifest = manifest;
	vm.$root.canvases = manifest.sequences[0].canvases;
	vm.$root.options = { language: 'en' };

	vm.$root.iiifConvertToArray = value => [value];

	it('should select label from multi-lanuage labels', () => {
		const { label } = vm.structures[0];
		expect(label).to.equal('Table of Contents');
	});
});
