import { describe, it, expect } from 'vitest';

import { getStartPage, isValidPagesArray, setManifest } from '../../../src/modules/store';

import manifest from '../../iiif-api/data/manifests/bl-vdc_00000004216E.json';

setManifest(manifest);

describe('isValidPagesArray', () => {
	it('validates page numbers', () => {
		expect(isValidPagesArray([1])).toEqual(true);
		expect(isValidPagesArray([0, 1])).toEqual(true);
		expect(isValidPagesArray([1, 3, 5])).toEqual(true);

		expect(isValidPagesArray(['nope'])).toEqual(false);
		expect(isValidPagesArray([-1])).toEqual(false);
		expect(isValidPagesArray([999])).toEqual(false);
		expect(isValidPagesArray([5, 3, 1])).toEqual(false);
	});
});

describe('getStartPage', () => {
	it('determines the start page based on startCanvas', () => {
		expect(getStartPage()).toEqual(7);
	});
});
