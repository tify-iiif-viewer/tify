describe('Export', () => {
	it('displays export links', () => {
		cy.visit('/?manifest=http://0.0.0.0:8081/manifest/gdz-PPN857449303');

		cy.contains('Export').click();
		cy.contains('Download Individual Images').should('be.visible');
		cy.contains('Page 1').should('be.visible'); // NOTE: Page set by startCanvas

		cy.get('[title="Next page"]').first().click();
		cy.contains('Page 2').should('be.visible');

		cy.contains('PDFs for each element').click();
		cy.contains('Titelseite').should('be.visible');

		cy.contains('a', 'IIIF manifest');

		cy.get('a[href$="/download/pdf/PPN857449303/LOG_0001.pdf"]');
	});
});
