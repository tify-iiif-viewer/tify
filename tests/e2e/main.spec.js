describe('Main', () => {
	it('starts the app', () => {
		cy.visit('/?manifest=http://0.0.0.0:8081/manifest/gdz-PPN857449303&language=de');
		cy.get('#tify > .tify');
	});

	it('checks the manifest (valid JSON, but not IIIF)', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit('/?manifest=http://0.0.0.0:8081/manifest/invalid');
		cy.contains('Please provide a valid IIIF Presentation API 2.x manifest');
	});

	it('checks the manifest (invalid JSON)', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit('/?manifest=http://0.0.0.0:8081/manifest/not-json');
		cy.contains('is not valid JSON');
	});
});
