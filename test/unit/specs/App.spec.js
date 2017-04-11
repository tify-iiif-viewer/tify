import Vue from 'vue';
import App from '@/App';

describe('App', () => {
	const vm = new (Vue.extend(App))().$mount();

	vm.manifest = {
		sequences: [
			{
				canvases: [1, 2, 3],
			},
		],
	};

	it('should validate page numbers', () => {
		expect(vm.isValidPage('nope')).to.equal(false);
		expect(vm.isValidPage(-1)).to.equal(false);
		expect(vm.isValidPage(999)).to.equal(false);
		expect(vm.isValidPage(2)).to.equal(true);
	});
});
