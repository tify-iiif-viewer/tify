import Vue from 'vue';
import MetadataList from '@/components/MetadataList';

describe('Metadata List', () => {
	const vm = new Vue(MetadataList);

	it('should format a label', () => {
		const label = 'example_label';
		const cleanedLabel = vm.cleanLabel(label);
		expect(cleanedLabel).toEqual('Example label');
	});
});
