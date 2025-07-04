import { describe, it, expect } from 'vitest';

import { getUniqueId } from '../../../src/modules/id';

describe('id', () => {
	it('generates IDs', () => {
		expect(getUniqueId()).toMatch(/[a-z0-9]{9,}/);
		expect(getUniqueId('tify')).toMatch(/tify-[a-z0-9]{9,}/);
		expect(getUniqueId('tify', '', 'component')).toMatch(/tify-[a-z0-9]{9,}-component/);
		expect(getUniqueId('tify', 'instance', 'component')).toMatch(/tify-instance-component/);
		expect(getUniqueId('', '', 'component')).toMatch(/[a-z0-9]{9,}-component/);
	});
});
