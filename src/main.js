import Vue from 'vue';
import Axios from 'axios';

import App from './App';

import iiifMixin from './mixins/iiif';
import paramsMixin from './mixins/params';
import uiMixin from './mixins/ui';

import './directives/click-outside';

Vue.prototype.$http = Axios;

window.Tify = function Tify(options = {}) {
	const defaultOptions = {
		breakpoints: {
			tiny: 359,
			small: 700,
			medium: 1000,
			large: 1300,
		},
		container: null,
		filters: {},
		language: 'en',
		manifestUrl: null,
		viewer: {},
		pageLabelFormat: 'P : L',
		pages: [1],
		pan: {},
		rotation: null,
		translationsDirUrl: null,
		urlQueryKey: null,
		urlQueryParams: [
			'filters',
			'pages',
			'pan',
			'rotation',
			'view',
			'zoom',
		],
		view: '',
		zoom: null,
	};

	this.options = { ...defaultOptions, ...options };

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
	this.app = new Vue({
		render: (h) => h(App),
		data() {
			return {
				api: {},
				error: '',
				id: `tify-${Math.floor(Math.random() * Date.now())}`,
				loading: 0,
				manifest: null,
				options: instance.options,
				readyPromise,
				translation: null,
			};
		},
		mixins: [
			iiifMixin,
			paramsMixin,
			uiMixin,
		],
		computed: {
			canvases() {
				return this.manifest.sequences[0].canvases;
			},
			pageCount() {
				return this.manifest.sequences[0].canvases.length;
			},
		},
		methods: {
			expose(method, name) {
				instance[name || method.name.replace('bound ', '')] = method;
			},
			getId(postfix) {
				return this.id + (postfix ? `-${postfix}` : '');
			},
			getPageLabel(number, label) {
				return this.options.pageLabelFormat.replace('P', number).replace('L', label);
			},
			translate(string, fallback) {
				if (this.translation && this.translation[string]) {
					return this.translation[string];
				}

				if (process.env.NODE_ENV !== 'production' && this.options.language !== 'en') {
					// eslint-disable-next-line no-console
					console.warn(`Missing translation for "${string}"`);
				}

				return fallback || string;
			},
		},
	});

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

		const el = document.createElement('div');
		containerEl.innerHTML = '';
		containerEl.appendChild(el);
		this.app.$mount(el);

		mounted = true;
	};

	// TODO: Add test
	this.destroy = () => {
		this.app.$destroy();
	};

	if (this.options.container) {
		this.mount(this.options.container);
	}
};

export default window.Tify;
