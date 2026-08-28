describe('Thumbnails', () => {
	it('navigates by clicking thumbnails', () => {
		cy.visit(`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/gdz-PPN857449303.json`);

		cy.contains('Pages').click();

		cy.get('.tify-thumbnails-item').eq(0).find('img[src$="gdz:PPN857449303:00000001/full/96,/0/default.jpg"]');
		cy.get('.tify-thumbnails-item').eq(0).contains('1 · ');

		cy.get('.tify-thumbnails-item').eq(3).contains('4 · ').click();

		cy.get('.tify-thumbnails-item').eq(3).should('have.class', '-current');
		cy.get('.tify-thumbnails-item').eq(4).should('have.class', '-current');
		cy.get('.tify-thumbnails-item.-current').should('have.length', 2);
	});

	it('selects multiple pages by control-clicking thumbnails', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'thumbnails',
		}));

		cy.visit(`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);

		cy.get('.tify-thumbnails-item').eq(2).click({ ctrlKey: true });
	});
});
