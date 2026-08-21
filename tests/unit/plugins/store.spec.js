import store from '../../../src/plugins/store';

import manifest from '../../iiif-api/data/manifests/gdz-PPN857449303.json';
import manifestWithFoldout from '../../iiif-api/data/iiif-cookbook/recipe/0035-foldouts/manifest.json';
import manifestWithStartCanvas from '../../iiif-api/data/manifests/bl-vdc_00000004216E.json';

const app1 = { config: { globalProperties: {} } };
store.install(app1, {
	manifest: store.convertManifest(manifest),
	options: {
		language: 'en',
		pageLabelFormat: 'P : L',
		translationsDirUrl: '',
	},
});
const store1 = app1.config.globalProperties.$store;

const app2 = { config: { globalProperties: {} } };
store.install(app2, { manifest: store.convertManifest(manifestWithFoldout) });
const store2 = app2.config.globalProperties.$store;

const app3 = { config: { globalProperties: {} } };
store.install(app3, { manifest: store.convertManifest(manifestWithStartCanvas) });
const store3 = app3.config.globalProperties.$store;

describe('getStartPages', () => {
	it('returns page 1 if startCanvas is not set', () => {
		expect(store2.getStartPages()).toEqual([1]);
	});

	it('returns the page determined by startCanvas', () => {
		expect(store3.getStartPages()).toEqual([7]);
	});
});

describe('localize', () => {
	it('returns the fallback string if there is no label', () => {
		expect(store1.localize({})).toEqual('');
		expect(store1.localize({ en: '' })).toEqual('');
		expect(store1.localize({ en: [] })).toEqual('');
	});

	it('merges multiple strings unless requested otherwise', () => {
		expect(store1.localize({ en: ['A', 'B'] })).toEqual('A · B' /* first space: &nbsp; */);
	});

	it('returns the first label if the set language is not available', () => {
		expect(store1.localize({ de: 'Beschriftung' })).toEqual('Beschriftung');
	});
});

describe('setPage', () => {
	it('sets the page', () => {
		expect(store1.setPage(1)).toEqual([1]);
		expect(store1.setPage([0, 1])).toEqual([0, 1]);
		expect(store1.setPage([1, 3, 5])).toEqual([1, 3, 5]);
	});

	it('throws an error when trying to set an invalid page', () => {
		expect(() => store1.setPage('nope')).toThrow(RangeError);
		expect(() => store1.setPage(-2)).toThrow(RangeError);
		expect(() => store1.setPage(999)).toThrow(RangeError);
		expect(() => store1.setPage([5, 3, 1])).toThrow(RangeError);
	});
});

describe('goToFirstPage', () => {
	it('does nothing on first page', () => {
		store1.setPage(1);
		store1.goToFirstPage();
		expect(store1.options.pages).toEqual([1]);
	});

	it('goes to page 1', () => {
		store1.setPage(10);
		store1.goToFirstPage();
		expect(store1.options.pages).toEqual([1]);
	});

	it('exits multi-page mode', () => {
		store1.setPage([3, 5, 7]);
		store1.goToFirstPage();
		expect(store1.options.pages).toEqual([1]);
	});
});

describe('goToLastPage', () => {
	it('does nothing on last page', () => {
		store1.setPage(41);
		store1.goToLastPage();
		expect(store1.options.pages).toEqual([41]);
	});

	it('goes to last page', () => {
		store1.setPage(10);
		store1.goToLastPage();
		expect(store1.options.pages).toEqual([41]);
	});

	it('exits multi-page mode', () => {
		store1.setPage([3, 5, 7]);
		store1.goToLastPage();
		expect(store1.options.pages).toEqual([41]);
	});
});

describe('goToNextPage', () => {
	it('does nothing on last page', () => {
		store1.setPage(41);
		store1.goToNextPage();
		expect(store1.options.pages).toEqual([41]);
	});

	it('advances one page', () => {
		store1.setPage(10);
		store1.goToNextPage();
		expect(store1.options.pages).toEqual([11]);
	});

	it('preserves double-page view', () => {
		store1.setPage([4, 5]);
		store1.goToNextPage();
		expect(store1.options.pages).toEqual([6, 7]);
	});

	it('exits multi-page mode', () => {
		store1.setPage([3, 5, 7]);
		store1.goToNextPage();
		expect(store1.options.pages).toEqual([8]);
	});
});

describe('goToPreviousPage', () => {
	it('does nothing on first page', () => {
		store1.setPage(1);
		store1.goToPreviousPage();
		expect(store1.options.pages).toEqual([1]);
	});

	it('goes back one page', () => {
		store1.setPage(10);
		store1.goToPreviousPage();
		expect(store1.options.pages).toEqual([9]);
	});

	it('preserves double-page view', () => {
		store1.setPage([4, 5]);
		store1.goToPreviousPage();
		expect(store1.options.pages).toEqual([2, 3]);
	});

	it('exits multi-page mode', () => {
		store1.setPage([3, 5, 7]);
		store1.goToPreviousPage();
		expect(store1.options.pages).toEqual([2]);
	});
});

describe('goToNextSection', () => {
	it('does nothing on last section', () => {
		store1.setPage(19);
		store1.goToNextSection();
		expect(store1.options.pages).toEqual([19]);
	});

	it('goes to next section start', () => {
		store1.setPage(1);
		store1.goToNextSection();
		expect(store1.options.pages).toEqual([2]);
	});

	it('preserves double-page view', () => {
		store1.setPage([2, 3]);
		store1.goToNextSection();
		expect(store1.options.pages).toEqual([18, 19]);
	});
});

describe('goToPreviousSection', () => {
	it('does nothing on first section', () => {
		store1.setPage(1);
		store1.goToPreviousSection();
		expect(store1.options.pages).toEqual([0, 1]);
	});

	it('goes to previous section start', () => {
		store1.setPage(19);
		store1.goToPreviousSection();
		expect(store1.options.pages).toEqual([2, 3]);
	});

	it('preserves double-page view', () => {
		store1.setPage([18, 19]);
		store1.goToPreviousSection();
		expect(store1.options.pages).toEqual([2, 3]);
	});
});

describe('getFacingPage', () => {
	it('returns 0 for the first page', () => {
		expect(store2.getFacingPage(1)).toBe(0);
	});

	it('returns -1 for non-paged pages', () => {
		expect(store2.getFacingPage(4)).toBe(-1);
	});

	it('pairs verso with following recto', () => {
		expect(store2.getFacingPage(2)).toBe(3);
	});

	it('pairs recto with preceding verso', () => {
		expect(store2.getFacingPage(3)).toBe(2);
	});

	it('offsets pairing after a non-paged page', () => {
		expect(store2.getFacingPage(5)).toBe(6);
		expect(store2.getFacingPage(6)).toBe(5);
		expect(store2.getFacingPage(7)).toBe(8);
		expect(store2.getFacingPage(8)).toBe(7);
	});

	it('returns 0 for a verso last page', () => {
		expect(store2.getFacingPage(9)).toBe(0);
	});
});
