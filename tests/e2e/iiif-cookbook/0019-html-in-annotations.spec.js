describe('IIIF Cookbook 0019: HTML in annotations', () => {
	before(() => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0019-html-in-annotations/manifest.json`
			+ '&tify={"view":"text"}',
		);
	});

	it('displays the annotation', () => {
		cy.contains('.tify-text-toggle', 'Gänseliesel Brunnen');
	});
});
