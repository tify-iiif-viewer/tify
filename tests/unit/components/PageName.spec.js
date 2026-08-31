import { mount } from '@vue/test-utils';

import PageName from '../../../src/components/PageName.vue';

import i18n from '../../../src/plugins/i18n';
import store from '../../../src/plugins/store';

import manifest from '../../iiif-api/data/manifests/mskgent-8210.json';

describe('PageName', () => {
	let wrapper;
	let vm;

	beforeEach(() => {
		const testManifest = JSON.parse(JSON.stringify(manifest));
		testManifest.items[0].label = { none: ['Potzblitz starts with <b>P</b>, not T'] };
		testManifest.items[1].label = {};

		wrapper = mount(PageName, {
			props: { number: 1 },
			global: {
				plugins: [
					i18n,
					[store, {
						manifest: store.convertManifest(testManifest),
						options: { language: 'en', pageLabelFormat: 'L : P/T' },
					}],
				],
			},
		});

		vm = wrapper.vm;
	});

	it('does not break page labels containing P or T', () => {
		// Expect P and T to be kept, but HTML to be stripped
		expect(vm.html).toEqual('Potzblitz starts with P, not T<span> : 1/2</span>');
	});

	it('displays a dash for empty labels', async () => {
		await wrapper.setProps({ number: 2 });
		expect(vm.html).toEqual('‒<span> : 2/2</span>');
	});
});
