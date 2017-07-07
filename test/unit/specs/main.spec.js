import vm from '@/main';

describe('main', () => {
	vm.manifest = {
		sequences: [
			{
				canvases: [1, 2, 3, 4, 5],
			},
		],
	};

	it('should get default params', () => {
		const params = vm.getParams();
		expect(params.pages).to.eql([1]);
		// On small screens, default panel is scan instead of info
		expect(params.view).to.equal('scan');
	});

	it('should validate page numbers', () => {
		expect(vm.isValidPagesArray(['nope'])).to.equal(false);
		expect(vm.isValidPagesArray([-1])).to.equal(false);
		expect(vm.isValidPagesArray([999])).to.equal(false);
		expect(vm.isValidPagesArray([5, 3, 1])).to.equal(false);
		expect(vm.isValidPagesArray([1])).to.equal(true);
		expect(vm.isValidPagesArray([0, 1])).to.equal(true);
		expect(vm.isValidPagesArray([1, 3, 5])).to.equal(true);
	});
});
