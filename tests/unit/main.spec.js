import Tify from '@/main';
import manifest from '../iiif-api/data/manifests/gdz-PPN857449303.json';

const { app } = new Tify();

describe('main', () => {
	app.manifest = manifest;

	it('should validate page numbers', () => {
		expect(app.isValidPagesArray([1])).toEqual(true);
		expect(app.isValidPagesArray([0, 1])).toEqual(true);
		expect(app.isValidPagesArray([1, 3, 5])).toEqual(true);

		expect(app.isValidPagesArray(['nope'])).toEqual(false);
		expect(app.isValidPagesArray([-1])).toEqual(false);
		expect(app.isValidPagesArray([999])).toEqual(false);
		expect(app.isValidPagesArray([5, 3, 1])).toEqual(false);
	});

	it('should set the page', () => {
		expect(app.setPage(1)).toEqual([1]);
		expect(app.setPage([0, 1])).toEqual([0, 1]);
		expect(app.setPage([1, 3, 5])).toEqual([1, 3, 5]);

		expect(() => app.setPage('nope')).toThrow(RangeError);
		expect(() => app.setPage(-1)).toThrow(RangeError);
		expect(() => app.setPage(999)).toThrow(RangeError);
		expect(() => app.setPage([5, 3, 1])).toThrow(RangeError);
	});
});

describe('filter-html', () => {
	it('should filter HTML', () => {
		const html = `
			<h1 id="remove tag">
				<a href="keep tag and attr" class="remove this">
					<b data-remove>label</b>
				</a>
			</h1>
			<p>
				<img src='keep - single quotes' alt="keep" id="remove" data-remove>
				<br class="keep tag remove class">
				<i><span invalid="remove attr">keep this</span></i>
			</p>
		`;

		const filteredHtml = `
			${''}
				<a href="keep tag and attr">
					<b>label</b>
				</a>
			${''}
			<p>
				<img src='keep - single quotes' alt="keep">
				<br>
				<i><span>keep this</span></i>
			</p>
		`;

		expect(app.filterHtml(html)).toEqual(filteredHtml);
	});
});
