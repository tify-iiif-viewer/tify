describe('Export', () => {
	it('displays export links', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN857449303`);

		cy.contains('Export').click();
		cy.contains('Media Files').should('be.visible');
		cy.contains('a[download]', '1 · -').should('be.visible'); // NOTE: Page set by startCanvas

		cy.get('[title="Next page"]').first().click();
		cy.contains('a[download]', '2 · -').should('be.visible');

		cy.contains('PDFs for each element').click();
		cy.contains('Titelseite').should('be.visible');

		cy.contains('a', 'IIIF manifest');

		cy.get('a[href$="/download/pdf/PPN857449303/LOG_0001.pdf"]');

		cy.contains('Other Formats').next().find('a').should('have.length', 4);
	});

	it('hides "Other Formats" if not available', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/aku-pal-375`);

		cy.contains('Export').click();

		cy.should('not.contain', 'Other Formats');
	});
});
