import Vue from 'vue';
import app from '@/main';

// Translate strings, use default (i.e. English) if not translated
// Translations are located in @/translations/<lang>.js
Vue.filter('trans', (string) => {
	// Do nothing when messages are not yet loaded
	if (!app.messages) return string;

	if (app.messages[string]) return app.messages[string];

	if (app.options.language !== 'en') {
		// eslint-disable-next-line no-console
		console.warn(`Missing translation for "${string}"`);
	}

	return string;
});
