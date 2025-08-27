describe('Collection', () => {
	it('shows the collection view', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b19974760`);

		// Only Info and Collection buttons should be visible
		cy.contains('Info');
		cy.contains('Collection');
		cy.should('not.contain', 'Text');
		cy.should('not.contain', 'Scan');
		cy.should('not.contain', 'Contents');
		cy.should('not.contain', 'Export');

		cy.contains('Volume 1, 1859').click();
		cy.contains('15. September 1859').click();
		cy.contains('The chemist and druggist, 15. September 1859');
	});

	it('filters the collection list', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b19974760`);

		cy.get('[aria-label="Filter collection"]').type('2008');
		cy.get('.tify-collection-item').should('have.length', 2);
		cy.get('[aria-label="Filter collection"]').type('nope');
		cy.contains('No results');
	});

	it('loads a child manifest', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			childManifestUrl: `${Cypress.env('iiifApiUrl')}/manifest/wellcome-b19974760_1_0004`,
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b19974760&tify=${encodedParams}`);

		cy.contains('Info').click();
		cy.contains('.tify-info-button', 'Collection').click();
		cy.contains('h1', 'The chemist and druggist, 15. September 1859');

		cy.contains('.tify-header-button', 'Collection').click();
		cy.contains('Volume 1').click();
		cy.contains('15. October 1859').click();
		cy.contains('h1', 'The chemist and druggist, 15. October 1859');
	});

	it('highlights the current child manifest', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b19974760`);

		cy.contains('Volume 1').click();
		cy.contains('15. September 1859').click();
		cy.contains('.tify-collection-item.-current', '15. September 1859');
	});
});
