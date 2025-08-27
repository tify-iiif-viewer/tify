import id from '../../../src/plugins/id';

const app = { config: { globalProperties: {} } };
id.install(app);

describe('getId', () => {
	it('generates unique IDs', () => {
		expect(app.config.globalProperties.$getId('label')).toMatch(/[a-z0-9-]{36}-label/);
	});
});
