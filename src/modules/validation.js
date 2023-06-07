export function isValidPagesArray(pages, pageCount) {
	if (!Array.isArray(pages)) {
		return false;
	}

	// Checking for duplicates
	if (new Set(pages).size !== pages.length) {
		return false;
	}

	for (let i = 0, len = pages.length; i < len; i += 1) {
		if (!Number.isInteger(pages[i])
			|| (i > 0 && pages[i] > 0 && pages[i] <= pages[i - 1])
			|| pages[i] < 0
			|| pages[i] > pageCount
		) return false;
	}

	return true;
}

export function isValidUrl(string, allowedProtocols = ['https:', 'http:']) {
	let url;

	try {
		url = new URL(string);
	} catch {
		return false;
	}

	return allowedProtocols.includes(url.protocol);
}
