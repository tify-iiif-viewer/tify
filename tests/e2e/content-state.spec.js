describe('IIIF Content State', () => {
	it('supports setting the manifest URL via URL query "iiif-content"', () => {
		cy.visit(`/?iiif-content=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN857449303.json`);

		cy.contains('De Supputatione Multitudinis');
	});
});
