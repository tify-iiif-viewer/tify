it('handles a missing thumbnail', () => {
	cy.visit(
		`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/cookbook-recipe-0283-missing-image`
		+ '&tify={"view":"thumbnails"}',
	);

	cy.get('.tify-thumbnails-item').should('have.length', 4);
	cy.get('.tify-thumbnails-item:eq(1) img[src="data:,"]');
});
