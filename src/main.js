import Vue from 'vue';
import App from '@/App';

Vue.prototype.$http = require('axios');

// In production mode, add stylesheet link to header
// In dev mode, stylesheet is inlined for hot reload
let stylesheetUrl;
if (process.env.NODE_ENV === 'production') {
	const scripts = document.getElementsByTagName('script');
	const scriptUrl = scripts[scripts.length - 1];
	stylesheetUrl = `${scriptUrl.src.substring(0, scriptUrl.src.lastIndexOf('/'))}/tify.css`;
} else {
	stylesheetUrl = null;
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

/* eslint-disable no-new */
const app = new Vue({
	el: container,
	render: h => h(App),
	data: {
		error: '',
		loading: false,
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
	mounted() {
		this.$http.interceptors.request.use((request) => {
			this.loading = true;
			return request;
		});

		this.$http.interceptors.response.use((response) => {
			this.loading = false;
			return response;
		});

		if (this.options.stylesheetUrl) this.appendStylesheet(this.options.stylesheetUrl);

		const translationUrl = `translations/${this.options.language}.json`;
		this.$http.get(translationUrl).then((response) => {
			this.messages = response.data;
		}, (error) => {
			const status = (error.response ? error.response.statusText : 'Disconnected');
			this.error = `Error loading translation ${this.options.language}: ${status}`;
		});

		// TODO: Interceptor should set this to true on first XHR, but does not
		this.loading = true;
	},
});

// Detect click outside of an element
Vue.directive('click-outside', {
	bind(el, binding, vnode) {
		/* eslint-disable no-param-reassign */
		el.event = (event) => {
			if (!(el === event.target || el.contains(event.target))) {
				vnode.context[binding.expression](event);
			}
		};
		document.body.addEventListener('click', el.event);
	},
	unbind(el) {
		document.body.removeEventListener('click', el.event);
	},
});

// Translate strings, use default (i.e. English) if not translated
// Translations are located in @/translations/<lang>.js
Vue.filter('trans', (string) => {
	if (app.messages[string]) return app.messages[string];

	if (process.env.NODE_ENV === 'development' && app.options.language !== 'en') {
		console.warn(`Missing translation for ${string}`); // eslint-disable-line no-console
	}
	return string;
});
