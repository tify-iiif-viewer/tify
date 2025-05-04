import { ref } from 'vue';

export default {
	install: (app) => {
		const translation = ref(null);

		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$translate = (string, fallback) => {
			const { language } = app.config.globalProperties.$store.options;
			const override = app.config.globalProperties.$store.options.translations?.[language]?.[string];
			if (override) {
				return override;
			}

			if (translation.value?.[string]) {
				return translation.value[string];
			}

			if (import.meta.env.DEV && translation.value) {
				// eslint-disable-next-line no-console
				console.warn(`Missing translation for "${string}"`);
			}

			return fallback || string.replace(/{.+?}/g, '').trim();
		};

		// NOTE: translationObject contains any number of key-value pairs, where
		// the key is the string in the default language (usually English), the
		// value is the translated string, e.g. { key: 'Schlüssel' }
		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$translate.setTranslation = (translationObject) => {
			translation.value = translationObject;
		};
	},
};
