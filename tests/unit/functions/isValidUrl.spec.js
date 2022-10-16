import isValidUrl from '@/functions/isValidUrl';

describe('isValidUrl', () => {
	it('validates a URL', () => {
		const validUrl = 'http://example.org';
		expect(isValidUrl(validUrl)).toEqual(true);

		const validUrlWithQuery = 'https://example.org/?query=something';
		expect(isValidUrl(validUrlWithQuery)).toEqual(true);

		const notAUrl = 'example.org';
		expect(isValidUrl(notAUrl)).toEqual(false);

		const notAHttpUrl = 'ftp://example.js';
		expect(isValidUrl(notAHttpUrl)).toEqual(false);
		expect(isValidUrl(notAHttpUrl, ['ftp:'])).toEqual(true);
	});
});
