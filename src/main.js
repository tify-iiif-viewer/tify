import { createApp, h } from 'vue';

import App from './App.vue';

import api from './plugins/api';
import i18n from './plugins/i18n';
import store from './plugins/store';

window.Tify = function Tify(userOptions = {}) {
	const defaultOptions = {
		breakpoints: {
			tiny: 359,
			small: 719,
			medium: 959,
			large: 1199,
		},
		childManifestAutoloaded: true,
		childManifestUrl: null,
		container: null,
		fallbackLanguage: 'en',
		filters: {},
		language: 'en',
		manifestUrl: null,
		optionsResetOnPageChange: [
			'pan',
		],
		pageLabelFormat: 'P : L',
		pages: null,
		pan: {},
		rotation: null,
		translationsDirUrl: null,
		urlQueryKey: null,
		urlQueryParams: [
			'childManifestUrl',
			'filters',
			'pages',
			'pan',
			'rotation',
			'view',
			'zoom',
		],
		view: null,
		viewer: {},
		zoom: null,
	};

	this.options = { ...defaultOptions, ...userOptions };

	if (!this.options.translationsDirUrl) {
		const scripts = document.getElementsByTagName('script');
		const tifyScript = [...scripts].find((script) => script.src.includes('/tify'));
		if (tifyScript) {
			const { src } = tifyScript;
			this.options.translationsDirUrl = `${src.substring(0, src.lastIndexOf('/'))}/translations`;
		}
	}

	let readyPromise = null;
	this.ready = new Promise((resolve, reject) => {
		readyPromise = { resolve, reject };
	});

	const instance = this;
	this.app = createApp({
		render: () => h(App, { readyPromise }),
	})
		.use(api, { instance })
		.use(i18n)
		.use(store, { options: this.options });

	// TODO: Add test
	let mounted = false;
	this.mount = (container) => {
		if (mounted) {
			throw new Error('TIFY is already mounted');
		}

		const containerEl = typeof container === 'string'
			? document.querySelector(container)
			: container;

		if (!containerEl) {
			throw new Error('Container element not found');
		}

		const style = window.getComputedStyle(containerEl);
		if (style.position === 'static') {
			containerEl.style.position = 'relative';
		}

		this.app.mount(containerEl);

		mounted = true;
	};

	// TODO: Add test
	this.destroy = () => {
		this.app.unmount();
	};

	if (this.options.container) {
		this.mount(this.options.container);
	}
};

export default window.Tify;
