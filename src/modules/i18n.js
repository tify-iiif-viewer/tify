import { fetchJson } from './http';
import { options, setTranslation, translation } from './store';
import { errorHandler } from './errorHandler';

export function setLanguage(language) {
	let resolveFunction;
	let rejectFunction;
	const promise = new Promise((resolve, reject) => {
		resolveFunction = resolve;
		rejectFunction = reject;
	});

	if (language === 'en') {
		options.language = 'en';
		setTranslation(null);
		resolveFunction(language);
		return promise;
	}

	if (options.translationsDirUrl === null) {
		rejectFunction(new Error('Could not determine translationsDirUrl'));
	}

	const translationUrl = `${options.translationsDirUrl}/${language}.json`;
	fetchJson(translationUrl).then((loadedTranslation) => {
		options.language = language;
		setTranslation(loadedTranslation);
		resolveFunction(language);
	}, (error) => {
		const status = error.response ? error.response.statusText : error.message;
		errorHandler.add(`Error loading translation for "${language}": ${status}`);
		rejectFunction(new Error(error));
	});

	return promise;
}

export function translate(string, fallback) {
	if (translation[string]) {
		return translation[string];
	}

	if (import.meta.env.DEV && Object.keys(translation).length) {
		// eslint-disable-next-line no-console
		console.warn(`Missing translation for "${string}"`);
	}

	return fallback || string;
}
