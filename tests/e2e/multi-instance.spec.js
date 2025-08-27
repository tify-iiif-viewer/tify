describe('Multi-instance', () => {
	it('starts multiple independent apps with different manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN857449303.json`
			+ `&manifest2=${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`);

		cy.contains('De Supputatione Multitudinis');
		cy.contains('Algebra : Vorlesungsmanuskript');

		cy.get('[title="View"]').eq(0).click();
		cy.get('[title="Next page"]:visible').eq(0).click();
		cy.get('.tify-page-select > button').eq(0).contains('2 · -');
		cy.get('.tify-page-select > button').eq(1).contains('1 · -');
	});
});
