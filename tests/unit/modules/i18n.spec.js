import { describe, it, expect } from 'vitest';

import { errorHandler } from '../../../src/modules/errorHandler';
import { setLanguage } from '../../../src/modules/i18n';
import { options } from '../../../src/modules/store';

options.translationsDirUrl = '';

describe('setLanguage', () => {
	it('loads the translation and changes the language', async () => {
		const result = await setLanguage('de');
		expect(result).toEqual('de');
	});

	it('throws an error if the translation cannot be loaded', async () => {
		try {
			await setLanguage('-_-');
		} catch {
			expect(errorHandler.messages.slice(-1)[0]).toContain('Error loading translation for "-_-"');
		}
	});
});
