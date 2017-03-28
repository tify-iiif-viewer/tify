import Vue from 'vue';
import App from '@/App';

import translationDe from '@/translations/de';
import translationEn from '@/translations/en';

Vue.use(require('vue-resource'));

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
		errorMessage: '',
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
		error(message) {
			this.errorMessage = message;
			this.loading = false;
			throw new Error(message);
		},
	},
	mounted() {
		if (this.options.stylesheetUrl) this.appendStylesheet(this.options.stylesheetUrl);

		const translations = {
			de: translationDe,
			en: translationEn,
		};
		this.messages = translations[this.options.language];
		if (!this.messages) this.error(`Translation not available: ${this.options.language}`);

		// TODO: Interceptor should set this to true on first XHR, but does not
		this.loading = true;
	},
});

// Set global loading during XHR requests
Vue.http.interceptors.push((request, next) => {
	this.loading = true;
	this.errorMessage = '';
	next(() => { this.loading = false; });
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
