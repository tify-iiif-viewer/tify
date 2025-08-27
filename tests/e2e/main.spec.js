describe('Main', () => {
	it('starts the app', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN857449303.json`);
		cy.get('.tify');
	});

	it('checks the manifest (valid JSON, but not IIIF)', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/invalid.json`);
		cy.contains('Please provide a valid IIIF Presentation API manifest');
	});

	it('checks the manifest (invalid JSON)', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/not-json.json`);
		cy.contains('Error loading IIIF manifest');
	});

	it('loads a translation', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN857449303.json&language=de`);

		cy.get('.tify-header');
		cy.contains('Seiten');
		cy.contains('Inhalt');
	});

	it('gracefully handles a missing translation', () => {
		// Prevent the test from failing due to an uncaught exception (which is expected)
		cy.on('uncaught:exception', () => false);

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN857449303.json&language=nope`);

		cy.get('.tify-header');
		cy.contains('Pages');
		cy.contains('Contents');
		cy.contains('Error loading translation “nope”');
	});
});
