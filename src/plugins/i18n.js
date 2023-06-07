export default {
	install: (app) => {
		let translation = null;

		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$translate = (string, fallback) => {
			if (translation && translation[string]) {
				return translation[string];
			}

			if (import.meta.env.DEV && translation) {
				// eslint-disable-next-line no-console
				console.warn(`Missing translation for "${string}"`);
			}

			return fallback || string;
		};

		// NOTE: translationObject contains any number of key-value pairs, where
		// the key is the string in the default language (usually English), the
		// value is the translated string, e.g. { key: 'Schlüssel' }
		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$translate.setTranslation = (translationObject) => {
			translation = translationObject;
		};
	},
};
