import Vue from 'vue';
import App from '@/App';

describe('App', () => {
	const vm = new Vue(App);

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
		expect(params.panel).to.equal('info');
	});

	it('should validate page numbers', () => {
		expect(vm.isValidPage('nope')).to.equal(false);
		expect(vm.isValidPage(-1)).to.equal(false);
		expect(vm.isValidPage(999)).to.equal(false);
		expect(vm.isValidPage(2)).to.equal(true);
	});
});
