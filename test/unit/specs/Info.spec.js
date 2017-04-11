import Vue from 'vue';
import Info from '@/panels/Info';

describe('Info', () => {
	const vm = new (Vue.extend(Info))().$mount();

	it('should filter HTML', () => {
		const html = '<h1 id="remove"><a href="keep this" class="remove this"><span>label</span></a></h1><img src="keep" alt="keep" id="remove" data-remove>';
		const filteredHtml = vm.filterHtml(html);
		expect(filteredHtml).to.equal('<a href="keep this">label</a><img src="keep" alt="keep">');
	});

	it('should format a label', () => {
		const label = 'example_label';
		const formattedLabel = vm.$options.filters.formatLabel(label);
		expect(formattedLabel).to.equal('Example label');
	});
});
