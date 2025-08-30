import { filenamifyUrl } from '../../../src/demo/modules/filenamify';

describe('filenamifyUrl', () => {
	it('turns a URL into a safe filename', () => {
		const url = 'https://example.org/path?query=something#hash';
		expect(filenamifyUrl(url)).toEqual('example.org-path-query=something#hash');
	});
});
