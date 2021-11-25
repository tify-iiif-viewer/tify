import Vue from 'vue';
import Info from '@/components/ViewInfo';

describe('Info', () => {
	const vm = new Vue(Info);

	it('should recognize a URL', () => {
		const url = 'http://example.org';
		expect(vm.isUrl(url)).toEqual(true);

		const url2 = 'https://example.org';
		expect(vm.isUrl(url2)).toEqual(true);

		const notAUrl = 'example.org';
		expect(vm.isUrl(notAUrl)).toEqual(false);

		const notAUrl2 = 'This does not start with https://';
		expect(vm.isUrl(notAUrl2)).toEqual(false);
	});
});
