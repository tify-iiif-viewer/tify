describe('IIIF Cookbook 0019: HTML in annotations', () => {
	it('displays the annotation overlay', () => {
		cy.visit(
			`/?manifest=${Cypress.expose('iiifApiUrl')}/iiif-cookbook/0021-tagging/manifest.json`
			+ '&tify={"view":"text"}',
		);
		cy.contains('Gänseliesel-Brunnen').click();
		cy.get('.tify-media-overlay').should('have.length', 1).should('have.class', '-current');
	});
});
