describe('Views', () => {
	it('Change view via buttons', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
		cy.get('.tify-app_main');

		cy.get('.-active').contains('Info');

		cy.contains('Fulltext').click();
		cy.get('.-active').contains('Fulltext');

		cy.contains('Pages').click();
		cy.get('.-active').contains('Pages');

		cy.contains('Contents').click();
		cy.get('.-active').contains('Contents');

		cy.contains('Info').click();
		cy.get('.-active').contains('Info');

		cy.contains('Export').click();
		cy.get('.-active').contains('Export');

		cy.contains('Help').click();
		cy.get('.-active').contains('Help');
	});

	it('Change view via keyboard', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.get('body').type('1').get('.-active').contains('Fulltext')
				cy.get('body').type('2').get('.-active').contains('Pages')
				cy.get('body').type('3').get('.-active').contains('Contents')
				cy.get('body').type('4').get('.-active').contains('Info')
				cy.get('body').type('5').get('.-active').contains('Export')
				cy.get('body').type('6').get('.-active').contains('Help');
			});
	});
});
