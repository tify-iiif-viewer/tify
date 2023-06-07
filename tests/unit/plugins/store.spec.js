import { describe, it, expect } from 'vitest';

import store from '../../../src/plugins/store';

import manifest from '../../iiif-api/data/manifests/bl-vdc_00000004216E.json';

const app = { config: { globalProperties: {} } };

store.install(app, {
	manifest,
	options: {
		pageLabelFormat: 'P : L',
		translationsDirUrl: '',
	},
});

const { $store } = app.config.globalProperties;

describe('getPageLabel', () => {
	it('gets the page label', () => {
		expect($store.getPageLabel(1, 'label')).toEqual('1 : label');
	});
});

describe('getStartPage', () => {
	it('determines the start page based on startCanvas', () => {
		expect($store.getStartPage()).toEqual(7);
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
		expect(() => $store.setPage(-1)).toThrow(RangeError);
		expect(() => $store.setPage(999)).toThrow(RangeError);
		expect(() => $store.setPage([5, 3, 1])).toThrow(RangeError);
	});
});
