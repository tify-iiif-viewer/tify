import Vue from 'vue';
import Axios from 'axios';

import App from '@/App';

import Icon from '@/components/Icon';

import iiifMixin from '@/mixins/iiif';
import paramsMixin from '@/mixins/params';
import uiMixin from '@/mixins/ui';

import '@/directives/click-outside';
import '@/polyfills/findIndex';

Vue.prototype.$http = Axios;

// Make <icon/> globally available
Vue.component('Icon', Icon);

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
		manifestUrl: '',
		openSeadragon: {},
		pageLabelFormat: 'P : L',
		pages: [1],
		panX: null,
		panY: null,
		paramsStoredInUrlQuery: [
			'filters',
			'pages',
			'panX',
			'panY',
			'rotation',
			'view',
			'zoom',
		],
		rotation: null,
		titleAffix: '',
		translationsDirUrl: '/translations',
		urlQueryKey: '',
		view: 'info',
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

	const instance = this;
	this.app = new Vue({
		render: (h) => h(App),
		data() {
			return {
				api: {},
				error: '',
				loading: 0,
				manifest: null,
				manifestUrl: '',
				messages: null,
				options: instance.options,
			};
		},
		mixins: [
			uiMixin,
			paramsMixin,
			iiifMixin,
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
			getPageLabel(number, label) {
				return this.options.pageLabelFormat.replace('P', number).replace('L', label);
			},
			translate(string) {
				if (this.messages && this.messages[string]) {
					return this.messages[string];
				}

				if (process.env.NODE_ENV !== 'production' && this.options.language !== 'en') {
					// eslint-disable-next-line no-console
					console.warn(`Missing translation for "${string}"`);
				}

				return string;
			},
		},
	});

	// TODO: Add test
	this.mount = (container) => {
		const containerEl = typeof container === 'string'
			? document.querySelector(container)
			: container;

		const style = window.getComputedStyle(containerEl);
		if (style.position === 'static') {
			containerEl.style.position = 'relative';
		}

		const el = document.createElement('div');
		containerEl.innerHTML = '';
		containerEl.appendChild(el);
		this.app.$mount(el);
	};

	if (this.options.container) {
		this.mount(this.options.container);
	}
};

export default window.Tify;
