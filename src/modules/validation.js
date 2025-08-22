export function isValidPagesArray(pages, pageCount) {
	if (!(pages instanceof Array) || !pageCount) {
		return false;
	}

	// Check for duplicates
	if (new Set(pages).size !== pages.length) {
		return false;
	}

	// Check if all pages exist
	for (let i = 0, len = pages.length; i < len; i += 1) {
		if (!Number.isInteger(pages[i])
			// Are there pages out of order?
			|| (i > 0 && pages[i] > 0 && pages[i] <= pages[i - 1])
			// Are there pages out of range? 0 and -1 serve as placeholder values.
			|| pages[i] < -1 || pages[i] > pageCount
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
