describe('Info', () => {
	it('Display related metadata', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.contains('Related Resources');
				cy.contains('http://localhost:8081/item/b18035723');
			});

		cy.visit('/?manifest=http://localhost:8081/manifest/ubl-0000000001.json');
		cy.contains('Related Resources');
		cy.contains('https://digital.ub.uni-leipzig.de/object/viewid/0000000001');
		cy.contains('https://iiif.ub.uni-leipzig.de/0000000001/manifest.json');
	});

	it('Collapse long metadata values', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
		cy.contains('button', 'Expand');
	});

	it('Show metadata of the current structure', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json');
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.contains('Current Element').should('be.visible');
				cy.contains('Titelseite');
				cy.contains('.tify-info_section.-metadata.-structure', 'Weigel, Erhard');

				cy.contains('Last page').click();
				cy.contains('Current Element').should('not.be.visible');
			});
	});

	it('Show metadata of a nested structure', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-DE_611_BF_5619_1801_1806.json');
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.contains('Next page').click().click().click().click();
				cy.contains('Current Element').should('be.visible');
				cy.contains('.tify-info_section.-metadata.-structure', '[Brief des Barons von Asch an Heyne vom 29.01./10.02.1801]');
			});
	});
});
