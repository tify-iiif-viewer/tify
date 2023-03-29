import { describe, it, expect } from 'vitest';

import { setPage } from '../../../src/modules/pagination';
import { setManifest } from '../../../src/modules/store';

import manifest from '../../iiif-api/data/manifests/bl-vdc_00000004216E.json';

setManifest(manifest);

describe('setPage', () => {
	it('sets the page', () => {
		expect(setPage(1)).toEqual([1]);
		expect(setPage([0, 1])).toEqual([0, 1]);
		expect(setPage([1, 3, 5])).toEqual([1, 3, 5]);

		expect(() => setPage('nope')).toThrow(RangeError);
		expect(() => setPage(-1)).toThrow(RangeError);
		expect(() => setPage(999)).toThrow(RangeError);
		expect(() => setPage([5, 3, 1])).toThrow(RangeError);
	});
});
