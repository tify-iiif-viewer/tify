export function parseCoordinatesString(coordinatesString) {
	if (typeof coordinatesString !== 'string') {
		return null;
	}

	const matches = coordinatesString.match(/xywh=(\d+),(\d+),(\d+),(\d+)$/);
	return matches
		? matches.slice(1).map(Number)
		: null;
}
