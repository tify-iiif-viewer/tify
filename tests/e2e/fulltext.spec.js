describe('Fulltext', () => {
	it('displays fulltext', () => {
		cy.visit('/?manifest=http://0.0.0.0:8081/manifest/wellcome-b18035723&tify={"pages":[15]}');
		cy.get('.tify').then(() => {
			cy.contains('Fulltext').click();
			cy.contains('Alles höhere Leben - ob Tier oder').should('be.visible');
		});
	});

	it('displays XML fulltext', () => {
		cy.visit('/?manifest=http://0.0.0.0:8081/manifest/gdz-PPN235181684_0029&tify={"view":"fulltext"}');
		cy.get('.tify').then(() => {
			cy.contains('Unter Mitwirkung der Herren').should('be.visible');
		});
	});
});
