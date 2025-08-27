describe('IIIF Cookbook 0025: Foldout as separate page in double-page view', () => {
	it('supports non-paged pages in paged manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0035-foldouts/manifest.json`);

		cy.contains('header', 'Front cover');
		cy.get('[title="Toggle double-page"][aria-pressed=true]');

		cy.contains('Pages').click();
		cy.get('.tify-thumbnails-item.-current:nth-child(1)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 1);

		cy.get('[title="Next page"]').eq(0).click();
		cy.get('.tify-thumbnails-item.-current:nth-child(2)');
		cy.get('.tify-thumbnails-item.-current:nth-child(3)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 2);

		cy.get('[title="Next page"]').eq(0).click();
		cy.get('.tify-thumbnails-item.-current:nth-child(4)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 1);

		cy.get('[title="Next page"]').eq(0).click();
		cy.get('.tify-thumbnails-item.-current:nth-child(5)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 1);

		cy.get('[title="Next page"]').eq(0).click();
		cy.get('.tify-thumbnails-item.-current:nth-child(6)');
		cy.get('.tify-thumbnails-item.-current:nth-child(7)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 2);

		cy.contains('.tify-thumbnails-item', 'Foldout, unfolded').click();
		cy.get('.tify-thumbnails-item.-current:nth-child(4)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 1);

		cy.contains('.tify-thumbnails-item', 'Inside front cover').click();
		cy.get('.tify-thumbnails-item.-current').should('have.length', 2);

		cy.get('[title="Toggle double-page"]').click();
		cy.get('.tify-thumbnails-item.-current:nth-child(3)');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 1);

		cy.get('.tify-thumbnails-item:nth-child(4)').click();
		cy.get('[title="Toggle double-page"]').click();
		cy.get('.tify-thumbnails-item.-current').should('have.length', 1);
	});
});
