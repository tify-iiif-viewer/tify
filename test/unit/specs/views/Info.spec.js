import Vue from 'vue';
import Info from '@/views/Info';

describe('Info', () => {
	const vm = new Vue(Info);

	it('should format a label', () => {
		const label = 'example_label';
		const cleanedLabel = vm.$options.filters.cleanLabel(label);
		expect(cleanedLabel).to.equal('Example label');
	});

	it('should recognize a URL', () => {
		const url = 'http://example.com';
		expect(vm.isUrl(url)).to.equal(true);

		const url2 = 'https://example.com';
		expect(vm.isUrl(url2)).to.equal(true);

		const notAUrl = 'example.com';
		expect(vm.isUrl(notAUrl)).to.equal(false);

		const notAUrl2 = 'This does not start with https://';
		expect(vm.isUrl(notAUrl2)).to.equal(false);
	});
});
