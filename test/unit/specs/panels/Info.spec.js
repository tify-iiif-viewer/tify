import Vue from 'vue';
import Info from '@/views/Info';

describe('Info', () => {
	const vm = new Vue(Info);

	it('should format a label', () => {
		const label = 'example_label';
		const cleanedLabel = vm.$options.filters.cleanLabel(label);
		expect(cleanedLabel).to.equal('Example label');
	});
});
