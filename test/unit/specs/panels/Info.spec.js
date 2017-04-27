import Vue from 'vue';
import Info from '@/panels/Info';

describe('Info', () => {
	const vm = new Vue(Info);

	it('should format a label', () => {
		const label = 'example_label';
		const formattedLabel = vm.$options.filters.formatLabel(label);
		expect(formattedLabel).to.equal('Example label');
	});
});
