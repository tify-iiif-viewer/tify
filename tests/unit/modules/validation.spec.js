import { describe, it, expect } from 'vitest';

import { isValidPagesArray, isValidUrl } from '../../../src/modules/validation';

describe('isValidPagesArray', () => {
	it('validates page numbers', () => {
		const pageCount = 5;

		expect(isValidPagesArray([1], pageCount)).toEqual(true);
		expect(isValidPagesArray([0, 1], pageCount)).toEqual(true);
		expect(isValidPagesArray([5, -1], pageCount)).toEqual(true);
		expect(isValidPagesArray([1, 3, 5], pageCount)).toEqual(true);

		expect(isValidPagesArray(['nope'], pageCount)).toEqual(false);
		expect(isValidPagesArray([1, 1], pageCount)).toEqual(false);
		expect(isValidPagesArray([-2], pageCount)).toEqual(false);
		expect(isValidPagesArray([999], pageCount)).toEqual(false);
		expect(isValidPagesArray([5, 3, 1], pageCount)).toEqual(false);
	});
});

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
