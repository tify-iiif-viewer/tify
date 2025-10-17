describe('IIIF Cookbook 0003: Simple video file', () => {
	before(() => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0003-mvm-video/manifest.json`);
	});

	it('shows the audio player', () => {
		cy.contains('h1', 'Video Example 3');
		cy.get('video').should('be.visible');

		// TODO: Extend
	});
});
