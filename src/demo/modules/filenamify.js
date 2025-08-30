export function filenamifyUrl(url) {
	return url
		.replace(/^https?:\/\//, '')
		.replace(/[\\/:*?"<>|]/g, '-');
}
