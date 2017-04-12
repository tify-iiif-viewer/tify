import Vue from 'vue';
import Info from '@/panels/Info';

describe('Info', () => {
	const vm = new (Vue.extend(Info))().$mount();

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

		expect(vm.filterHtml(html)).to.equal(filteredHtml);
	});

	it('should format a label', () => {
		const label = 'example_label';
		const formattedLabel = vm.$options.filters.formatLabel(label);
		expect(formattedLabel).to.equal('Example label');
	});
});
