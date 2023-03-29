import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import MetadataList from '../../../src/components/MetadataList.vue';

describe('Metadata List', () => {
	const { vm } = mount(MetadataList);

	it('formats a label', () => {
		const label = 'example_label';
		const cleanedLabel = vm.cleanLabel(label);
		expect(cleanedLabel).toEqual('Example label');
	});
});
