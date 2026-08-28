import { mount } from '@vue/test-utils';

import AppHeader from '../../../src/components/AppHeader.vue';

import api from '../../../src/plugins/api';
import defaultOptions from '../../../src/config';
import i18n from '../../../src/plugins/i18n';
import id from '../../../src/plugins/id';
import store from '../../../src/plugins/store';

import manifest from '../../iiif-api/data/manifests/utrecht-1874-325480.json';

describe('AppHeader', () => {
	const wrapper = mount(AppHeader, {
		global: {
			plugins: [
				[api, { instance: {} }],
				i18n,
				id,
				[store, {
					options: {
						...defaultOptions,
						pages: [1],
					},
					rootElement: document.body.appendChild(document.createElement('div')),
				}],
			],
		},
	});

	const { vm } = wrapper;

	it('shows manifest-dependent views when a manifest is loaded', () => {
		vm.$store.collection = undefined;
		vm.$store.manifest = manifest;

		expect(vm.availableViews).toEqual([null, 'thumbnails', 'info', 'export']);
	});

	it('shows collection-dependent views when a collection is loaded', () => {
		vm.$store.collection = { id: 'dummy-collection' };
		vm.$store.manifest = undefined;

		expect(vm.availableViews).toEqual(['info', 'export', 'collection']);
	});

	it('shows text and TOC views if enabled', async () => {
		vm.$store.collection = undefined;
		vm.$store.manifest = manifest;

		await wrapper.setProps({ textEnabled: true, tocEnabled: true });

		expect(vm.availableViews).toEqual([null, 'text', 'thumbnails', 'toc', 'info', 'export']);
	});

	it('respects the views option', () => {
		vm.$store.collection = undefined;
		vm.$store.manifest = manifest;

		vm.$store.options.views = ['export', 'text'];

		expect(vm.availableViews).toEqual([null, 'export', 'text']);
	});
});
