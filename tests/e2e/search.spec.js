describe('Search', () => {
	it('is only available for manifests with a search service', () => {
		cy.visit(`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/cookbook-recipe-0021-tagging.json`);
		cy.contains('Info');
		cy.get('.tify-header-button.-search').should('not.exist');

		cy.visit(`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/search.json`);
		cy.get('.tify-header-button.-search').should('exist');
	});

	it('searches with IIIF Content Search 2 and highlights hits', () => {
		cy.visit(`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/search.json`);

		cy.contains('.tify-header-button', 'Search').click();
		cy.get('.tify-search-input').type('gouda{enter}');

		cy.contains('.tify-search-count', '3 results');
		cy.get('.tify-search-page').should('have.length', 2);
		cy.contains('.tify-search-hit', 'the city of Gouda in Holland');
		cy.url().should('include', 'searchQuery');

		// Hits on the current page are highlighted
		cy.get('.tify-media-overlay.-search').should('have.length', 1);

		// Clicking a hit on another page opens that page
		cy.contains('.tify-search-hit', 'Goude').click();
		cy.contains('.tify-page-select > button', '3');
		cy.get('.tify-media-overlay.-search').should('have.length', 2);
		cy.get('.tify-media-overlay.-search.-current').should('have.length', 1);
		cy.get('.tify-search-item.-current').should('have.length', 1);
	});

	it('searches with IIIF Content Search 1', () => {
		const params = encodeURIComponent(JSON.stringify({ searchQuery: 'gouda', view: 'search' }));
		cy.visit(`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/search-v1.json&tify=${params}`);

		cy.get('.tify-search-input').should('have.value', 'gouda');
		cy.contains('.tify-search-count', '1 result');
		cy.contains('.tify-search-hit', 'cheese from Gouda.').click();
		cy.contains('.tify-page-select > button', '2');
		cy.get('.tify-media-overlay.-search.-current').should('have.length', 1);
	});
});
