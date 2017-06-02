import vm from '@/main';

describe('main', () => {
	vm.manifest = {
		sequences: [
			{
				canvases: [1, 2, 3],
			},
		],
	};

	it('should get default params', () => {
		const params = vm.getParams();
		expect(params.page).to.equal(1);
		// On small screens, default panel is scan instead of info
		expect(params.view).to.equal('scan');
	});

	it('should validate page numbers', () => {
		expect(vm.isValidPage('nope')).to.equal(false);
		expect(vm.isValidPage(-1)).to.equal(false);
		expect(vm.isValidPage(999)).to.equal(false);
		expect(vm.isValidPage(2)).to.equal(true);
	});
});
