import Tify from '@/main';
import manifest from '../iiif-api/data/manifests/bl-vdc_00000004216E.json';

const { app } = new Tify();

app.$http.get = (url) => new Promise((resolve, reject) => {
	if (url === '/de.json') {
		resolve({});
	} else {
		reject(new Error());
	}
});

app.options.translationsDirUrl = '';

describe('main', () => {
	app.manifest = manifest;

	it('determines the start page based on startCanvas', () => {
		expect(app.getStartPage()).toEqual(7);
	});

	it('validates page numbers', () => {
		expect(app.isValidPagesArray([1])).toEqual(true);
		expect(app.isValidPagesArray([0, 1])).toEqual(true);
		expect(app.isValidPagesArray([1, 3, 5])).toEqual(true);

		expect(app.isValidPagesArray(['nope'])).toEqual(false);
		expect(app.isValidPagesArray([-1])).toEqual(false);
		expect(app.isValidPagesArray([999])).toEqual(false);
		expect(app.isValidPagesArray([5, 3, 1])).toEqual(false);
	});

	it('sets the page', () => {
		expect(app.setPage(1)).toEqual([1]);
		expect(app.setPage([0, 1])).toEqual([0, 1]);
		expect(app.setPage([1, 3, 5])).toEqual([1, 3, 5]);

		expect(() => app.setPage('nope')).toThrow(RangeError);
		expect(() => app.setPage(-1)).toThrow(RangeError);
		expect(() => app.setPage(999)).toThrow(RangeError);
		expect(() => app.setPage([5, 3, 1])).toThrow(RangeError);
	});

	it('loads the translation and changes the language', async () => {
		const result = await app.setLanguage('de');
		expect(result).toEqual('de');
	});

	it('throws an error if the translation cannot be loaded', async () => {
		try {
			await app.setLanguage('-_-');
		} catch (error) {
			expect(error.message).toContain('Error loading translation for "-_-"');
		}
	});
});

describe('filter html', () => {
	it('filters HTML', () => {
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

describe('get page label', () => {
	it('gets the page label', () => {
		expect(app.getPageLabel(1, 'label')).toEqual('1 : label');
	});
});
