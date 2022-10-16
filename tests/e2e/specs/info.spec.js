describe('Info', () => {
	it('displays related metadata', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b18035723');
		cy.contains('Info').click();
		cy.contains('Related Resources');
		cy.contains('Wunder der Vererbung / von Fritz Bolle.');

		cy.visit('/?manifest=http://localhost:8081/manifest/ubl-0000000001');
		cy.contains('Info').click();
		cy.contains('Related Resources');
		cy.contains('http://localhost:8081/object/viewid/0000000001');
		cy.contains('http://localhost:8081/0000000001/manifest.json');
	});

	it('collapses long metadata values', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081');
		cy.contains('button', 'Expand');
	});

	it('shows metadata of the current structure', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303');
		cy.contains('Info').click();
		cy.contains('Current Element').should('be.visible');
		cy.contains('Titelseite');

		cy.get('[title="Last page"]').first().click();
		cy.contains('Current Element').should('not.be.visible');
	});

	it('shows metadata of a nested structure', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-DE_611_BF_5619_1801_1806');
		cy.contains('Info').click();
		cy.get('[title="Next page"]').first()
			.click()
			.click()
			.click()
			.click();
		cy.contains('Current Element').should('be.visible');
		cy.contains(
			'.tify-info-section.-metadata.-structure',
			'[Brief des Barons von Asch an Heyne vom 29.01./10.02.1801]',
		);
	});
});
