describe('Main', () => {
	it('starts the app', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN857449303`);
		cy.get('.tify');
	});

	it('checks the manifest (valid JSON, but not IIIF)', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/invalid`);
		cy.contains('Please provide a valid IIIF Presentation API manifest');
	});

	it('checks the manifest (invalid JSON)', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/not-json`);
		cy.contains('Error loading IIIF manifest');
	});
});
