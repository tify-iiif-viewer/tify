describe('Fulltext', () => {
	it('Display fulltext', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json&tify={"pages":[15]}');
		cy.get('.tify').then(() => {
			cy.contains('Fulltext').click();
			cy.contains('Alles höhere Leben - ob Tier oder').should('be.visible');
		});
	});
});
