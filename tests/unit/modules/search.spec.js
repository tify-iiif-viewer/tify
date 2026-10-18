import store from '../../../src/plugins/store';
import { getSearchService, getSearchUrl, parseSearchResponse } from '../../../src/modules/search';

const manifest = {
	items: [
		{ id: 'https://example.org/canvas/1' },
		{ id: 'https://example.org/canvas/2' },
	],
};

describe('getSearchService', () => {
	it('prefers Search 2 over Search 1', () => {
		expect(getSearchService({
			service: [
				{ id: 'https://example.org/search/1', type: 'SearchService1' },
				{ id: 'https://example.org/search/2', type: 'SearchService2' },
			],
		})).toEqual({ id: 'https://example.org/search/2', version: 2 });
	});

	it('detects services by profile', () => {
		expect(getSearchService({
			service: {
				'@id': 'https://example.org/search/1',
				profile: 'http://iiif.io/api/search/1/search',
			},
		})).toEqual({ id: 'https://example.org/search/1', version: 1 });
	});

	it('detects Search 0 services of upgraded IIIF 2 manifests', () => {
		const upgradedManifest = store.convertManifest({
			'@context': 'http://iiif.io/api/presentation/2/context.json',
			'@id': 'https://example.org/manifest',
			'@type': 'sc:Manifest',
			label: 'Manifest',
			service: {
				'@context': 'http://iiif.io/api/search/0/context.json',
				'@id': 'https://example.org/search/0',
				profile: 'http://iiif.io/api/search/0/search',
			},
			sequences: [],
		});

		expect(getSearchService(upgradedManifest)).toEqual({ id: 'https://example.org/search/0', version: 1 });
	});

	it('returns null if there is no search service', () => {
		expect(getSearchService(null)).toBeNull();
		expect(getSearchService({})).toBeNull();
		expect(getSearchService({ service: [{ id: 'https://example.org/auth', type: 'AuthProbeService2' }] })).toBeNull();
		expect(getSearchService({ service: [{ type: 'SearchService2' }] })).toBeNull();
	});
});

describe('getSearchUrl', () => {
	it('adds the encoded query', () => {
		expect(getSearchUrl('https://example.org/search', 'a & b')).toBe('https://example.org/search?q=a+%26+b');
		expect(getSearchUrl('https://example.org/search?lang=en', 'x')).toBe('https://example.org/search?lang=en&q=x');
	});
});

describe('parseSearchResponse', () => {
	it('parses Search 1 responses', () => {
		const result = parseSearchResponse({
			'@id': 'https://example.org/search?q=gouda',
			within: { '@type': 'sc:Layer', total: 3 },
			next: 'https://example.org/search?q=gouda&page=1',
			resources: [
				{
					'@id': 'https://example.org/anno/1',
					'@type': 'oa:Annotation',
					resource: { '@type': 'cnt:ContentAsText', chars: 'Gouda' },
					on: 'https://example.org/canvas/2#xywh=10,20,30,40',
				},
				{
					'@id': 'https://example.org/anno/2',
					'@type': 'oa:Annotation',
					resource: { '@type': 'cnt:ContentAsText', chars: 'Goude' },
					on: {
						'@type': 'oa:SpecificResource',
						full: 'https://example.org/canvas/1',
						selector: { '@type': 'oa:FragmentSelector', value: 'xywh=1,2,3,4' },
					},
				},
				{
					'@id': 'https://example.org/anno/3',
					resource: { chars: 'Gouda' },
					on: 'https://example.org/unknown-canvas#xywh=1,2,3,4',
				},
			],
			hits: [
				{
					'@type': 'search:Hit',
					annotations: ['https://example.org/anno/1'],
					match: 'Gouda',
					before: 'the city of ',
					after: ' in Holland',
				},
			],
		}, manifest);

		expect(result.total).toBe(3);
		expect(result.next).toBe('https://example.org/search?q=gouda&page=1');
		expect(result.hits).toEqual([
			{
				id: 'https://example.org/anno/1',
				page: 2,
				coords: [10, 20, 30, 40],
				text: 'Gouda',
				before: 'the city of ',
				after: ' in Holland',
			},
			{
				id: 'https://example.org/anno/2',
				page: 1,
				coords: [1, 2, 3, 4],
				text: 'Goude',
				before: '',
				after: '',
			},
		]);
	});

	it('parses Search 2 responses', () => {
		const result = parseSearchResponse({
			id: 'https://example.org/search/2?q=gouda',
			type: 'AnnotationPage',
			partOf: { type: 'AnnotationCollection', total: 2 },
			items: [
				{
					id: 'https://example.org/anno/1',
					type: 'Annotation',
					motivation: 'highlighting',
					body: { type: 'TextualBody', value: 'Gouda' },
					target: {
						type: 'SpecificResource',
						source: 'https://example.org/canvas/1',
						selector: {
							type: 'FragmentSelector',
							conformsTo: 'http://www.w3.org/TR/media-frags/',
							value: 'xywh=569,56,273,58',
						},
					},
				},
				{
					id: 'https://example.org/anno/2',
					type: 'Annotation',
					motivation: 'highlighting',
					target: 'https://example.org/canvas/2#xywh=5,6,7,8',
				},
			],
			annotations: [
				{
					type: 'AnnotationPage',
					items: [
						{
							type: 'Annotation',
							motivation: 'contextualizing',
							target: {
								type: 'SpecificResource',
								source: { id: 'https://example.org/anno/2', type: 'Annotation' },
								selector: [{
									type: 'TextQuoteSelector',
									prefix: 'near ',
									exact: 'Goude',
									suffix: ' river',
								}],
							},
						},
					],
				},
			],
		}, manifest);

		expect(result.total).toBe(2);
		expect(result.next).toBeNull();
		expect(result.hits).toEqual([
			{
				id: 'https://example.org/anno/1',
				page: 1,
				coords: [569, 56, 273, 58],
				text: 'Gouda',
				before: '',
				after: '',
			},
			{
				id: 'https://example.org/anno/2',
				page: 2,
				coords: [5, 6, 7, 8],
				text: 'Goude',
				before: 'near ',
				after: ' river',
			},
		]);
	});

	it('handles hits without coordinates and empty responses', () => {
		expect(parseSearchResponse({
			items: [{ id: 'a', target: 'https://example.org/canvas/1' }],
		}, manifest).hits).toEqual([
			{
				id: 'a',
				page: 1,
				coords: null,
				text: '',
				before: '',
				after: '',
			},
		]);

		expect(parseSearchResponse({}, manifest)).toEqual({ total: 0, next: null, hits: [] });
	});

	it('uses contextualizing annotations erroneously listed as items for context only', () => {
		const result = parseSearchResponse({
			partOf: { total: 3 },
			items: [
				{
					id: 'https://example.org/anno/1',
					motivation: 'highlighting',
					target: 'https://example.org/canvas/1#xywh=1,2,3,4',
				},
				{
					id: 'https://example.org/anno/2',
					motivation: 'highlighting',
					target: 'https://example.org/canvas/1#xywh=5,6,7,8',
				},
				{
					id: 'https://example.org/hit/1',
					motivation: 'contextualizing',
					body: { type: 'TextualBody', value: 'GOUDA Gouda' },
					target: [
						{
							type: 'SpecificResource',
							source: 'https://example.org/anno/1',
							selector: { type: 'TextQuoteSelector', exact: 'GOUDA', suffix: ' Gouda' },
						},
						'https://example.org/anno/2',
					],
				},
			],
		}, manifest);

		expect(result.total).toBe(2);
		expect(result.hits.map((hit) => [hit.id, hit.text, hit.after])).toEqual([
			['https://example.org/anno/1', 'GOUDA', ' Gouda'],
			['https://example.org/anno/2', '', ''],
		]);
	});
});
