describe('Multi-instance', () => {
	it('starts multiple independent apps with different manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN857449303`
			+ `&manifest2=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`);

		cy.contains('De Supputatione Multitudinis');
		cy.contains('Algebra : Vorlesungsmanuskript');

		cy.get('[title="Next page"]').eq(0).click();
		cy.get('.tify-page-select-button').eq(0).contains('2 · -');
		cy.get('.tify-page-select-button').eq(1).contains('1 · -');
	});
});
