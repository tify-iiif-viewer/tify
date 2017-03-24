import Vue from 'vue';
import App from '@/App';

import translationDe from '@/translations/de';
import translationEn from '@/translations/en';

Vue.use(require('vue-resource'));

const options = Object.assign({
	container: '#tify',
	language: 'en',
	manifest: null,
	stylesheet: null,
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
	mounted() {
		// Load stylesheet
		if (this.options.stylesheet) {
			const link = document.createElement('link');
			link.href = this.options.stylesheet;
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}

		// TODO: Interceptor should set this to true on first XHR, but does not
		this.loading = true;

		const translations = {
			de: translationDe,
			en: translationEn,
		};

		this.messages = translations[this.options.language];
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
