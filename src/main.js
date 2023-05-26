import { createApp, h } from 'vue';
import clickOutside from 'click-outside-vue3';

import App from './App.vue';

import { expose } from './modules/api';
import { errorHandler } from './modules/errorHandler';
import { initOptions } from './modules/http';
import { setLanguage } from './modules/i18n';
import { loadManifest } from './modules/iiif';
import { setPage } from './modules/pagination';
import { options, urlUpdateTimeout } from './modules/store';

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
		data() {
			return {
				collection: null,
				error: '',
				manifest: null,
				options: instance.options,
				ready: false,
				readyPromise,
				translation: null,
			};
		},
		created() {
			this.options.root = this;

			Object.assign(options, instance.options);

			expose(setLanguage);
			expose(setPage);
		},
		mounted() {
			// Set current breakpoint as classes on container element for use in CSS
			this.updateBreakpoint();
			window.addEventListener('resize', this.updateBreakpoint);

			if (!this.options.manifestUrl) {
				errorHandler.add('Missing option "manifestUrl"');
				return;
			}

			Promise.all([
				loadManifest(this.options.manifestUrl, {}, this),
				setLanguage(this.options.language),
			]).then(() => {
				this.$nextTick(() => {
					this.ready = true;
					this.readyPromise.resolve();
				});
			}, (error) => {
				this.readyPromise.reject(error);
			});
		},
		beforeUnmount() {
			clearTimeout(urlUpdateTimeout);
			window.removeEventListener('resize', this.updateBreakpoint);
			window.removeEventListener('popstate', initOptions);
		},
		methods: {
			updateBreakpoint() {
				Object.keys(this.options.breakpoints).forEach((breakpoint) => {
					if (this.$el.clientWidth <= this.options.breakpoints[breakpoint]) {
						this.$el.classList.add(`-${breakpoint}`);
					} else {
						this.$el.classList.remove(`-${breakpoint}`);
					}
				});

				if (this.$el.clientHeight < 520) {
					this.$el.classList.add('-short');
				} else {
					this.$el.classList.remove('-short');
				}
			},
		},
		render() {
			return h(App, { ready: this.ready });
		},
	});

	this.app.use(clickOutside);

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
