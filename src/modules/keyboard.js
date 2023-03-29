export function preventEvent(event) {
	if (event.altKey || event.ctrlKey || event.metaKey) {
		return true;
	}

	if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.nodeName) && event.target.type !== 'range') {
		return true;
	}

	return false;
}
