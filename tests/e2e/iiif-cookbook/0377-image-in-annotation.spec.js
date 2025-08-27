describe('IIIF Cookbook 0377: Image in annotations', () => {
	it('displays images in annotations', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0377-image-in-annotation/manifest.json`
			+ '&tify={"view":"text"}',
		);

		cy.get('.tify-text img[src$="918ecd18c2592080851777620de9bcb5-fountain/full/300,/0/default.jpg"]');
		cy.contains('.tify-text', 'Night picture of the Gänseliesel fountain');
	});
});
