import Vue from 'vue';
import Info from '@/views/Info';

describe('Info', () => {
	const vm = new Vue(Info);

	it('should recognize a URL', () => {
		const url = 'http://example.com';
		expect(vm.isUrl(url)).toEqual(true);

		const url2 = 'https://example.com';
		expect(vm.isUrl(url2)).toEqual(true);

		const notAUrl = 'example.com';
		expect(vm.isUrl(notAUrl)).toEqual(false);

		const notAUrl2 = 'This does not start with https://';
		expect(vm.isUrl(notAUrl2)).toEqual(false);
	});
});
