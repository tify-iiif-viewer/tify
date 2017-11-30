import Vue from 'vue';
import MetadataList from '@/components/MetadataList';

describe('Metadata List', () => {
	const vm = new Vue(MetadataList);

	it('should format a label', () => {
		const label = 'example_label';
		const cleanedLabel = vm.$options.filters.cleanLabel(label);
		expect(cleanedLabel).to.equal('Example label');
	});
});
