import { describe, it, expect } from 'vitest';

import { error } from '../../../src/modules/error';
import { setLanguage } from '../../../src/modules/i18n';

describe('setLanguage', () => {
	it('loads the translation and changes the language', async () => {
		const result = await setLanguage('de');
		expect(result).toEqual('de');
	});

	it('throws an error if the translation cannot be loaded', async () => {
		try {
			await setLanguage('-_-');
		} catch {
			expect(error.value).toContain('Error loading translation for "-_-"');
		}
	});
});
