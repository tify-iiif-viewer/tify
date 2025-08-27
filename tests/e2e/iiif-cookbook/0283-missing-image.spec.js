describe('IIIF Cookbook 0283: Missing image', () => {
	it('handles a missing thumbnail', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0283-missing-image/manifest.json`
			+ '&tify={"view":"thumbnails"}',
		);

		cy.get('.tify-thumbnails-item').should('have.length', 4);
		cy.contains('.tify-thumbnails-item:eq(1)', 'Image missing');
	});
});
