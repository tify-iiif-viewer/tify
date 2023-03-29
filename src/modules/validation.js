export function isValidUrl(string, allowedProtocols = ['https:', 'http:']) {
	let url;

	try {
		url = new URL(string);
	} catch {
		return false;
	}

	return allowedProtocols.includes(url.protocol);
}
