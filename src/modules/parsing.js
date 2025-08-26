export function parseCoordinatesString(coordinatesString) {
	return coordinatesString
		?.split('xywh=')[1]
		?.split(',')
		.map((number) => parseFloat(number));
}
