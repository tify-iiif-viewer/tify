describe('Collection', () => {
	it('shows the collection view', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b19974760');

		// Only Info and Collection buttons should be visible
		cy.contains('Info');
		cy.contains('Collection');
		cy.should('not.contain', 'Fulltext');
		cy.should('not.contain', 'Scan');
		cy.should('not.contain', 'Contents');
		cy.should('not.contain', 'Export');

		cy.contains('Volume 1, 1859').click();
		cy.contains('15. September 1859').click();
		cy.contains('The chemist and druggist, 15. September 1859');
	});

	it('filters the collection list', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/wellcome-b19974760');

		cy.get('[aria-label="Filter collection"]').type('2008');
		cy.get('.tify-collection-item').should('have.length', 2);
		cy.get('[aria-label="Filter collection"]').type('nope');
		cy.contains('No results');
	});

	it('loads the specified child manifest', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			childManifestUrl: 'http://localhost:8081/manifest/wellcome-b19974760_1_0004',
		}));

		cy.visit(`/?manifest=http://localhost:8081/manifest/wellcome-b19974760&tify=${encodedParams}`);

		cy.contains('Info').click();
		cy.contains('.tify-info-button', 'Collection').click();
		cy.contains('The chemist and druggist.');
	});
});
