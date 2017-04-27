import Vue from 'vue';
import '@/filters';

describe('filter-html', () => {
	it('should filter HTML', () => {
		const html = `
			<h1 id="remove tag">
				<a href="keep tag and attr" class="remove this">
					<b>label</b>
				</a>
			</h1>
			<p>
				<img src="keep" alt="keep" id="remove" data-remove>
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
				<img src="keep" alt="keep">
				<br>
				<i><span>keep this</span></i>
			</p>
		`;

		expect(Vue.options.filters.filterHtml(html)).to.equal(filteredHtml);
	});
});
