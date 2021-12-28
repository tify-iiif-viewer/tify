describe('Main', () => {
	it('Start the app', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json&language=de');
		cy.get('#tify > .tify');
	});

	it('Check manifest', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN497825848-00000001-info.json');
		cy.get('.tify').contains('Please provide a valid IIIF Presentation API 2.x manifest');
	});
});
