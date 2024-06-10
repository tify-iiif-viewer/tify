describe('Fulltext', () => {
	it('displays fulltext', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b18035723&tify={"pages":[15]}`);

		cy.contains('Fulltext').click();
		cy.contains('Alles höhere Leben - ob Tier oder').should('be.visible');
	});

	it('displays XML fulltext', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN235181684_0029&tify={"view":"fulltext"}`);

		cy.contains('Unter Mitwirkung der Herren').should('be.visible');
	});
});
