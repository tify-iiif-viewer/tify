import { describe, it, expect } from 'vitest';

import store from '../../../src/plugins/store';

import manifest from '../../iiif-api/data/manifests/bl-vdc_00000004216E.json';

const app = { config: { globalProperties: {} } };

store.install(app, {
	manifest: store.convertManifest(manifest),
	options: {
		language: 'en',
		pageLabelFormat: 'P : L',
		translationsDirUrl: '',
	},
});

const { $store } = app.config.globalProperties;

// TODO: Add test for getFacingPage

describe('getStartPages', () => {
	it('determines the start page based on startCanvas', () => {
		expect($store.getStartPages()).toEqual([7]);
	});
});

describe('localize', () => {
	it('returns the fallback string if there is no label', () => {
		expect($store.localize({})).toEqual('');
		expect($store.localize({ en: '' })).toEqual('');
		expect($store.localize({ en: [] })).toEqual('');
	});

	it('merges multiple strings unless requested otherwise', () => {
		expect($store.localize({ en: ['A', 'B'] })).toEqual('A · B' /* first space: &nbsp; */);
	});

	it('returns the first label if the set language is not available', () => {
		expect($store.localize({ de: 'Beschriftung' })).toEqual('Beschriftung');
	});
});

describe('setPage', () => {
	it('sets the page', () => {
		expect($store.setPage(1)).toEqual([1]);
		expect($store.setPage([0, 1])).toEqual([0, 1]);
		expect($store.setPage([1, 3, 5])).toEqual([1, 3, 5]);
	});

	it('throws an error when trying to set an invalid page', () => {
		expect(() => $store.setPage('nope')).toThrow(RangeError);
		expect(() => $store.setPage(-2)).toThrow(RangeError);
		expect(() => $store.setPage(999)).toThrow(RangeError);
		expect(() => $store.setPage([5, 3, 1])).toThrow(RangeError);
	});
});
