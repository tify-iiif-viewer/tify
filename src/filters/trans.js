import Vue from 'vue';
import app from '@/main';

// Translate strings, use default (i.e. English) if not translated
// Translations are located in @/translations/<lang>.js
Vue.filter('trans', (string) => {
	if (app.messages[string]) return app.messages[string];

	if (process.env.NODE_ENV === 'development' && app.options.language !== 'en') {
		console.warn(`Missing translation for ${string}`); // eslint-disable-line no-console
	}
	return string;
});
