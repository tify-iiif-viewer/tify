describe('IIIF Cookbook 0266: Full-canvas annotation', () => {
	it('does not display an annotation overlay', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0266-full-canvas-annotation/manifest.json`
			+ '&tify={"view":"text"}',
		);
		cy.get('.tify-media-overlay').should('not.exist');
	});
});
