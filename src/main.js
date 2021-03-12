import Vue from 'vue';
import App from '@/App'; // eslint-disable-line import/no-cycle

import Icon from '@/components/Icon';

import iiifMixin from '@/mixins/iiif';
import paramsMixin from '@/mixins/params';
import uiMixin from '@/mixins/ui';

import '@/directives/click-outside';

import '@/filters/trans'; // eslint-disable-line import/no-cycle

import '@/polyfills/findIndex';

// Make <icon/> globally available
Vue.component('Icon', Icon);

if (window.tifyOptions) {
	if (typeof window.tifyOptions !== 'object') {
		throw new Error('tifyOptions must be an object');
	}

	Object.keys(window.tifyOptions).forEach((key) => {
		switch (key) {
		case 'breakpoints':
			if (typeof breakpoints !== 'object') {
				throw new Error(`TIFY option ${key} must be an object (keys: breakpoint names, values: widths in px)`);
			}
			break;
		case 'container':
			if (typeof window.tifyOptions[key] !== 'string' && !(window.tifyOptions[key] instanceof HTMLElement)) {
				throw new Error(`TIFY option ${key} must be a string or an HTMLElement`);
			}
			break;
		case 'immediateRender':
		case 'init':
			if (typeof window.tifyOptions[key] !== 'boolean') {
				throw new Error(`TIFY option "${key}" must be boolean`);
			}
			break;
		case 'language':
		case 'tileFormat':
			if (typeof window.tifyOptions[key] !== 'string') {
				throw new Error(`TIFY option "${key}" must be a string`);
			}
			break;
		case 'title':
		case 'manifest':
		case 'stylesheet':
			if (typeof window.tifyOptions[key] !== 'string' && window.tifyOptions[key] !== null) {
				throw new Error(`TIFY option "${key}" must be a string (URL) or null`);
			}
			break;
		default:
			throw new Error(`Unknown TIFY option: "${key}"`);
		}
	});
}

// TODO: We cannot be sure that TIFY was loaded in a script tag, add a base option
let base;
let stylesheetUrl;
if (process.env.NODE_ENV === 'production') {
	const scripts = document.getElementsByTagName('script');
	const scriptUrl = scripts[scripts.length - 1];
	base = scriptUrl.src.substring(0, scriptUrl.src.lastIndexOf('/'));
	stylesheetUrl = `${base}/tify.css`;
} else {
	base = '';
	stylesheetUrl = null;
}

const options = {
	breakpoints: {
		large: 1300,
		medium: 1000,
		small: 700,
		tiny: 359,
	},
	container: '#tify',
	immediateRender: true,
	init: true,
	language: 'en',
	manifest: null,
	stylesheet: stylesheetUrl,
	title: 'TIFY',
	tileFormat: 'jpg',
	...window.tifyOptions,
};

const Tify = new Vue({
	render: (h) => h(App),
	data: {
		base,
		error: '',
		loading: 0,
		manifest: null,
		manifestUrl: '',
		messages: null,
		options,
		params: {},
		paramsTimer: null,
	},
	mixins: [uiMixin, paramsMixin, iiifMixin],
	computed: {
		canvases() {
			return this.manifest.sequences[0].canvases;
		},
		pageCount() {
			return this.manifest.sequences[0].canvases.length;
		},
	},
});

Tify.init = () => {
	const container = typeof options.container === 'string'
		? document.querySelector(options.container)
		: options.container;

	if (!container) return;

	const el = document.createElement('div');
	container.appendChild(el);
	Tify.$mount(el);
};

if (options.init) {
	Tify.init();
}

window.Tify = Tify;

export default Tify;
