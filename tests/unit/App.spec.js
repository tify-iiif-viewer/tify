import { shallowMount } from '@vue/test-utils';
import Axios from 'axios';
import Vue from 'vue';
import App from '@/App';

Vue.prototype.$http = Axios;
Vue.prototype.$http.get = (url) => new Promise((resolve, reject) => {
	if (url === '/de.json') {
		resolve({});
	} else {
		reject(new Error());
	}
});

describe('App', () => {
	const wrapper = shallowMount(App, {
		parentComponent: {
			data: {
				options: {
					translationsDirUrl: '',
				},
			},
			methods: {
				expose() { },
			},
		},
	});

	it('should load the translation and change the language', async () => {
		const result = await wrapper.vm.setLanguage('de');
		expect(result).toEqual('de');
	});

	it('should throw an error if the translation cannot be loaded', async () => {
		try {
			await wrapper.vm.setLanguage('-_-');
		} catch (e) {
			expect(e.message).toContain('Error loading translation for "-_-"');
		}
	});
});
