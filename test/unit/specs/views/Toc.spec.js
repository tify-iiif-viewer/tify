import Vue from 'vue';
import Toc from '@/views/Toc';

import manifest from '../../../iiif-api/data/manifests/bsb00026283.json';

describe('Toc', () => {
	const vm = new Vue(Toc);
	vm.$root.manifest = manifest;
	vm.$root.canvases = manifest.sequences[0].canvases;

	vm.$root.iiifConvertToArray = (value) => {
		// NOTE - function will be called on structure.label data,
		// which are (for this manifest) either strings or arrays of objects with 'value' property
		if (Array.isArray(value)) {
			// NOTE - we are testing for english title here (see below)
			return [value.find(thisValue => thisValue['@language'].indexOf('en') === 0)['@value']];
		}
		return [value];
	};

	it('should select label from multi-lanuage labels', () => {
		const { label } = vm.structures[0];
		expect(label).to.equal('Table of Contents');
	});
});
