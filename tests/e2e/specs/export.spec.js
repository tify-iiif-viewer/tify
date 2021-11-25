describe('Export', () => {
	it('Display export links', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json');
		cy.get('.tify-app_main').then(() => {
			cy.contains('Export').click();
			cy.contains('Download Individual Images').should('be.visible');
			cy.contains('Page 1').should('be.visible');
			cy.contains('Next page').click();
			cy.contains('Page 2').should('be.visible');

			cy.contains('PDFs for each element').click();
			cy.contains('Titelseite').should('be.visible');

			cy.get('a[href="https://gdzdev.sub.uni-goettingen.de/download/pdf/PPN857449303/LOG_0001.pdf"]');
		});
	});
});
