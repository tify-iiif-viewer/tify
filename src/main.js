import Vue from 'vue';
import App from '@/App';

import '@/directives/click-outside';

import '@/filters/filter-html';
import '@/filters/trans';

import '@/polyfills/findIndex';

// Polyfill Promise for IE 11
if (!window.Promise) window.Promise = require('promise-polyfill');

Vue.prototype.$http = require('axios');

// In production mode, load the stylesheet by adding a <link> to <head>
// In dev mode, the stylesheet is inlined for hot reload
// TODO: We cannot be sure that TIFY was loaded in a script tag, add a base option
let base = '.';
let stylesheetUrl = null;
if (process.env.NODE_ENV === 'production') {
	const scripts = document.getElementsByTagName('script');
	const scriptUrl = scripts[scripts.length - 1];
	base = scriptUrl.src.substring(0, scriptUrl.src.lastIndexOf('/'));
	stylesheetUrl = `${base}/tify.css`;
}

const options = Object.assign({
	container: '#tify',
	immediateRender: true,
	language: 'en',
	manifestUrl: null,
	stylesheetUrl,
	title: 'TIFY',
}, window.tifyOptions);

const container = document.createElement('div');
const el = document.querySelector(options.container);
if (el) {
	el.appendChild(container);
} else if (process.env.NODE_ENV !== 'testing') {
	throw new Error('TIFY container element not found');
}

export default new Vue({
	el: container,
	render: h => h(App),
	data: {
		error: '',
		loading: 0,
		manifest: null,
		manifestUrl: '',
		messages: null,
		options,
		params: {},
		paramsTimer: null,
	},
	computed: {
		canvases() {
			return this.manifest.sequences[0].canvases;
		},
		pageCount() {
			return this.manifest.sequences[0].canvases.length;
		},
	},
	methods: {
		appendStylesheet(url) {
			const link = document.createElement('link');
			link.href = url;
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		},
		getParams() {
			let params = {};
			try {
				params = JSON.parse(this.getQueryParam('tify')) || {};
			} catch (e) {
				// Nothing to do here
			}

			if (this.isMobile() && !params.view) {
				params.view = 'scan';
			} else if (typeof params.view === 'undefined') {
				params.view = 'info';
			}

			let pages;
			if (this.isValidPagesArray(params.pages)) {
				pages = params.pages;
			} else {
				if (params.pages) this.error = 'Invalid pages, reset to first page';
				pages = [1];
			}

			return {
				filters: params.filters || {},
				pages,
				panX: parseFloat(params.panX) || null,
				panY: parseFloat(params.panY) || null,
				rotation: parseInt(params.rotation, 10) || null,
				view: params.view,
				zoom: parseFloat(params.zoom) || null,
			};
		},
		getQueryParam(name) {
			const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		},
		iiifConvertToArray(value) {
			// http://iiif.io/api/presentation/2.1/#language-of-property-values
			const filterHtml = this.$options.filters.filterHtml;

			if (!(value instanceof Array)) {
				if (typeof value === 'object') {
					if (value['@value']) return [filterHtml(value['@value'])];
					if (value['@id']) {
						const id = filterHtml(value['@id']);
						return [{ '@id': id, label: (value.label ? filterHtml(value.label) : id) }];
					}
					return ['(Invalid value)'];
				}

				return [filterHtml(value)];
			}

			const language = this.options.language;
			const displayedValues = [];
			const translation = {};
			value.forEach((item) => {
				if (typeof item === 'string' || (item['@id'] && item.label)) {
					displayedValues.push(item);
				} else if (item && typeof item !== 'object') {
					displayedValues.push(filterHtml(item));
				} else if (item['@language'] && item['@value']) {
					if (!translation.fallback) translation.fallback = item['@value'];

					if (item['@language'].indexOf('en') === 0) {
						// Language is en or en-US or en-GB
						translation.en = item['@value'];
					} else if (item['@language'] === language) {
						translation.preferred = item['@value'];
					}
				}
			});

			const translatedValue = (
				translation.preferred
				|| translation.en
				|| translation.fallback
				|| null
			);
			if (translatedValue) displayedValues.push(filterHtml(translatedValue));

			return displayedValues;
		},
		isMobile() {
			const width = window.innerWidth
				|| document.documentElement.clientWidth
				|| document.body.clientWidth;
			return width < 1024;
		},
		isValidPagesArray(pages) {
			if (!Array.isArray(pages)) return false;

			// Check for duplicates
			if ((new Set(pages)).size !== pages.length) return false;

			for (let i = 0; i < pages.length; i += 1) {
				if (
					isNaN(pages[i])
					|| (i > 0 && pages[i] > 0 && pages[i] <= pages[i - 1])
					|| pages[i] < 0
					|| pages[i] > this.pageCount
				) return false;
			}

			return true;
		},
		setPage(page) {
			const pages = this.params.pages;
			if (pages[0] % 2 < 1 && (pages[1] === pages[0] + 1 || pages[1] === 0)) {
				const newPage = (page % 2 > 0 ? page - 1 : page);
				this.updateParams({ pages: [newPage, newPage === this.pageCount ? 0 : newPage + 1] });
				return;
			}
			this.updateParams({ pages: [page] });
		},
		updateParams(params) {
			Object.assign(this.params, params);

			if (!window.history) return;

			clearTimeout(this.paramsTimeout);
			this.paramsTimeout = setTimeout(() => {
				const storedParams = {};
				Object.keys(this.params).forEach((key) => {
					const param = this.params[key];
					if (
						param === null
						|| (key === 'pages' && param.length < 2 && param[0] < 2)
						|| (typeof param === 'object' && !Object.keys(param).length)
					) {
						delete storedParams[key];
					} else {
						storedParams[key] = this.params[key];
					}
				});

				const regex = /([?&])tify=.*?(&|$)/;
				const tifyParams = `tify=${JSON.stringify(storedParams)}`;
				const uri = window.location.href;
				const newUrl = uri.match(regex)
					? uri.replace(regex, `$1${tifyParams}$2`)
					: `${uri}${uri.indexOf('?') < 0 ? '?' : '&'}${tifyParams}`;

				if (params.pages) {
					this.error = '';
					window.history.pushState({}, '', newUrl);
				} else {
					window.history.replaceState({}, '', newUrl);
				}
			}, 100);
		},
	},
	created() {
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

		if (this.options.stylesheetUrl) this.appendStylesheet(this.options.stylesheetUrl);

		// Manifest URL in tifyOptions trumps query param
		this.manifestUrl = this.options.manifestUrl || this.getQueryParam('manifestUrl');
		if (!this.manifestUrl) {
			this.error = 'Missing query parameter or option: manifestUrl';
			return;
		} else if (this.options.manifestUrl && this.params.manifestUrl) {
			this.error = 'Setting manifestUrl via query parameter is disabled';
		}

		this.$http.get(this.manifestUrl).then((response) => {
			this.manifest = response.data;

			// Merging user-set query params with defaults
			this.params = this.getParams();
			window.addEventListener('popstate', () => {
				this.params = this.getParams();
			});

			if (this.options.title) {
				window.document.title = `${this.iiifConvertToArray(this.manifest.label)[0]} | ${this.options.title}`;
			}
		}, (error) => {
			const status = (error.response ? error.response.statusText : error.message);
			this.error = `Error loading IIIF manifest: ${status}`;
		});

		if (this.options.language !== 'en') {
			const translationUrl = `${base}/translations/${this.options.language}.json`;
			this.$http.get(translationUrl).then((response) => {
				this.messages = response.data;
			}, (error) => {
				const status = (error.response ? error.response.statusText : error.message);
				this.error = `Error loading translation ${this.options.language}: ${status}`;
			});
		}
	},
});
