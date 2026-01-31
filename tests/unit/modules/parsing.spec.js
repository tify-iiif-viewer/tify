import { parseCoordinatesString } from '../../../src/modules/parsing';

describe('parseCoordinatesString', () => {
	it('should parse valid strings', () => {
		expect(parseCoordinatesString('https://example.org/#xywh=10,20,30,40')).toEqual([10, 20, 30, 40]);
		expect(parseCoordinatesString('xywh=10,20,30,40')).toEqual([10, 20, 30, 40]);
		expect(parseCoordinatesString('xywh=0,0,10,10')).toEqual([0, 0, 10, 10]);
	});

	it('should return null for invalid values', () => {
		expect(parseCoordinatesString('xywh=10,20,30')).toBeNull();
		expect(parseCoordinatesString('xywh=10,20,30,40,50')).toBeNull();
		expect(parseCoordinatesString('xywh=a,b,c,d')).toBeNull();
		expect(parseCoordinatesString('xywh=10,20,30,x')).toBeNull();
		expect(parseCoordinatesString('xywh=')).toBeNull();
		expect(parseCoordinatesString('invalid')).toBeNull();
		expect(parseCoordinatesString('')).toBeNull();
		expect(parseCoordinatesString(null)).toBeNull();
		expect(parseCoordinatesString(undefined)).toBeNull();
		expect(parseCoordinatesString(123)).toBeNull();
		expect(parseCoordinatesString([])).toBeNull();
		expect(parseCoordinatesString({})).toBeNull();
	});
});
