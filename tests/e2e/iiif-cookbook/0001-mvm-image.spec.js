describe('IIIF Cookbook 0001: Simple single-page manifest without image service', () => {
	before(() => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0001-mvm-image/manifest.json`);
	});

	it('shows the title and the canvas', () => {
		cy.contains('h1', 'Single Image Example');
		cy.get('.openseadragon-canvas').should('be.visible');
	});
});
