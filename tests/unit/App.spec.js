import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import pkg from '../../package.json';

import App from '../../src/App.vue';

import api from '../../src/plugins/api';
import defaultOptions from '../../src/config';
import store from '../../src/plugins/store';
import i18n from '../../src/plugins/i18n';

describe('setLanguage', () => {
	const { vm } = mount(App, {
		global: {
			plugins: [
				[api, { instance: this }],
				i18n,
				store,
			],
		},
		props: {
			readyPromise: {},
		},
	});

	vm.$store.options = defaultOptions;
	vm.$store.options.translationsDirUrl = 'translations';

	// Replace fetchJson to return a mock object
	vm.$store.fetchJson = (url) => new Promise((resolve, reject) => {
		if (url === `translations/de.json?${pkg.version}`) {
			resolve({ $language: 'Deutsch' });
		} else {
			reject(new Error());
		}
	});

	it('loads the translation and changes the language', async () => {
		const result = await vm.setLanguage('de');
		expect(result).toEqual('de');
	});

	it('throws an error when the translation cannot be loaded', async () => {
		try {
			await vm.setLanguage('-_-');
		} catch {
			expect(vm.$store.errors.values().next()).toContain('Error loading translation for “-_-”');
		}
	});
});
