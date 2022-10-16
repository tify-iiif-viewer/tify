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
			small: 719,
			medium: 959,
			large: 1199,
		},
		childManifestAutoloaded: true,
		childManifestUrl: null,
		container: null,
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
		view: '',
		viewer: {},
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
				collection: null,
				error: '',
				id: `tify-${Math.floor(Math.random() * Date.now())}`,
				loading: 0,
				manifest: null,
				options: instance.options,
				ready: false,
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
				return this.manifest ? this.manifest.sequences[0].canvases : [];
			},
			pageCount() {
				return this.manifest ? this.manifest.sequences[0].canvases.length : 0;
			},
		},
		created() {
			this.expose(this.setLanguage);
		},
		mounted() {
			this.$http.interceptors.request.use((request) => {
				this.loading += 1;
				return request;
			});

			this.$http.interceptors.response.use((response) => {
				if (this.loading > 0) this.loading -= 1;
				return response;
			}, (error) => {
				this.loading = 0;
				return Promise.reject(error);
			});

			if (!this.options.manifestUrl) {
				this.error = 'Missing option "manifestUrl"';
				return;
			}

			Promise.all([
				this.loadManifest(this.options.manifestUrl),
				this.setLanguage(this.options.language),
			]).then(() => {
				this.$nextTick(() => {
					this.ready = true;
					this.readyPromise.resolve();
				});
			}, (error) => {
				this.readyPromise.reject(error);
			});
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
			setLanguage(language) {
				let resolveFunction;
				let rejectFunction;
				const promise = new Promise((resolve, reject) => {
					resolveFunction = resolve;
					rejectFunction = reject;
				});

				if (language === 'en') {
					this.options.language = 'en';
					this.translation = null;
					resolveFunction(language);
					return promise;
				}

				if (this.options.translationsDirUrl === null) {
					rejectFunction(new Error('Could not determine translationsDirUrl'));
				}

				const translationUrl = `${this.options.translationsDirUrl}/${language}.json`;
				this.$http.get(translationUrl).then((response) => {
					this.options.language = language;
					this.translation = response.data;
					resolveFunction(language);
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.error = `Error loading translation for "${language}": ${status}`;
					rejectFunction(new Error(this.error));
				});

				return promise;
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
