describe('IIIF Cookbook 0002: Simple audio file', () => {
	before(() => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0002-mvm-audio/manifest.json`);
	});

	it('shows the audio player', () => {
		cy.contains('h1', 'Simplest Audio Example 1')
		cy.get('audio')

		// TODO: Extend
	});
});
