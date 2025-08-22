export function formatDate(string, language) {
	try {
		return new Date(string).toLocaleDateString(language, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	} catch {
		return string;
	}
}
