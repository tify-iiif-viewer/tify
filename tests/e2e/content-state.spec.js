describe('IIIF Content State', () => {
	it('supports setting the manifest URL via URL query "iiif-content"', () => {
		cy.visit(`/?iiif-content=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN857449303`);

		cy.get('.header').should('not.exist');
		cy.contains('De Supputatione Multitudinis');
	});
});
