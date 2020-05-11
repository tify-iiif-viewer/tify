import vm from '@/main';

import manifest from '../iiif-api/data/manifests/gdz-PPN857449303.json';

describe('main', () => {
	vm.$root.manifest = manifest;
	vm.$root.params = { filters: {}, pages: [1] };

	it('should get default params', () => {
		const params = vm.getParams();
		expect(params.pages).toEqual([1]);
		// On small screens, default panel is scan instead of info
		expect(params.view).toEqual('scan');
	});

	it('should validate page numbers', () => {
		expect(vm.isValidPagesArray(['nope'])).toEqual(false);
		expect(vm.isValidPagesArray([-1])).toEqual(false);
		expect(vm.isValidPagesArray([999])).toEqual(false);
		expect(vm.isValidPagesArray([5, 3, 1])).toEqual(false);
		expect(vm.isValidPagesArray([1])).toEqual(true);
		expect(vm.isValidPagesArray([0, 1])).toEqual(true);
		expect(vm.isValidPagesArray([1, 3, 5])).toEqual(true);
	});
});
