import Vue from 'vue';
import App from '@/App';

import './directives';
import './filters';

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
	language: 'en',
	manifestUrl: null,
	stylesheetUrl,
	title: 'TIFY',
}, window.tifyOptions);

const container = document.createElement('div');
document.querySelector(options.container).appendChild(container);

export default new Vue({
	render: h => h(App),
	data: {
		error: '',
		loading: 0,
		messages: {},
		options,
	},
	methods: {
		appendStylesheet(url) {
			const link = document.createElement('link');
			link.href = url;
			link.rel = 'stylesheet';
			document.head.appendChild(link);
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

		const translationUrl = `${base}/translations/${this.options.language}.json`;
		this.$http.get(translationUrl).then((response) => {
			this.messages = response.data;

			// Wait for the translation to be available before mounting the app
			this.$mount(container);
		}, (error) => {
			const status = (error.response ? error.response.statusText : error.message);
			this.error = `Error loading translation ${this.options.language}: ${status}`;
		});
	},
});
