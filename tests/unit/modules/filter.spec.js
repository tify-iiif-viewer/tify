import { filterHtml } from '../../../src/modules/filter';

describe('filterHtml', () => {
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
				<a href=keep-this-unquoted-attribute style=remove-this-unquotes-attribute>Text</a>
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
				<a href=keep-this-unquoted-attribute>Text</a>
			</p>
		`;

		expect(filterHtml(html)).toEqual(filteredHtml);
	});
});
