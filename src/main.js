import { createApp, h } from 'vue';

import App from './App.vue';

import defaultOptions from './config';

import api from './plugins/api';
import i18n from './plugins/i18n';
import store from './plugins/store';

window.Tify = function Tify(userOptions = {}) {
	this.options = {
		// Create independent deep clone
		...JSON.parse(JSON.stringify(defaultOptions)),
		...userOptions,
	};

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
