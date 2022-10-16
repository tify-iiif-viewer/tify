describe('Main', () => {
	it('starts the app', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303&language=de');
		cy.get('#tify > .tify');
	});

	it('checks the manifest', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/invalid');
		cy.contains('Please provide a valid IIIF Presentation API 2.x manifest');
	});
});
