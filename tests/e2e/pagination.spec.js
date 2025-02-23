describe('Pagination', () => {
	const currentPage = '.tify-page-select-button';

	it('changes the page via buttons', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081&tify={"pages":[15]}`);

		cy.contains(currentPage, '15 : 7r');

		cy.get('[title="First page"]').first().click();
		cy.contains(currentPage, '1 : -');

		Cypress._.times(2, () => cy.get('[title="Next page"]').first().click());
		cy.contains(currentPage, '3 : 1r');

		Cypress._.times(2, () => cy.get('[title="Next section"]').first().click());
		cy.contains(currentPage, '7 : 3r');

		cy.get('[title="Last page"]').first().click();
		cy.contains(currentPage, '69 : -');

		Cypress._.times(4, () => cy.get('[title="Previous section"]').first().click());
		cy.contains('16 : 7v');

		cy.get('[title="Toggle double-page"]').first().click();
		cy.get('[title="Toggle double-page"].-active');
	});

	it('changes the page via keyboard', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081&tify={"pages":[15]}`);

		cy.contains(currentPage, '15 : 7r');

		cy.get('.tify').type('q');
		cy.contains(currentPage, '14 : 6v');
		cy.get('.tify').type('e');
		cy.contains(currentPage, '15 : 7r');

		cy.get('.tify').type('b');
		cy.contains(currentPage, '14 : 6v');
		cy.get('[title="Toggle double-page"].-active');

		cy.get('.tify').type('q');
		cy.contains(currentPage, '12 : 5v');
		cy.get('.tify').type(',');
		cy.contains(currentPage, '10 : 4v');

		cy.get('.tify').type('e');
		cy.contains(currentPage, '12 : 5v');
		cy.get('.tify').type('.');
		cy.contains(currentPage, '14 : 6v');

		cy.get('.tify').type('Q');
		cy.contains(currentPage, '1 : -');

		cy.get('.tify').type('E');
		cy.contains(currentPage, '68 : -');

		cy.get('.tify').type('b');
		cy.contains(currentPage, '68 : -');
		cy.get('[title="Toggle double-page"]:not(.-active)');

		cy.get('.tify').type('Q');
		cy.contains(currentPage, '1 : -');

		cy.get('.tify').type('E');
		cy.contains(currentPage, '69 : -');
	});

	it('highlights the current page after a page change', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`);
		cy.get('[title="Last page"]').first().click();
		cy.contains('Current page: 69 : -').first().click();
		cy.contains('.-current.-highlighted', '69 : -');
	});

	it('changes the page on small touchscreens', () => {
		cy.viewport(375, 667);
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`);

		cy.get('[title="View"]').click();
		cy.contains('Pages').should('be.visible');
		cy.get('[title="View"]').click();
		cy.contains('Pages').should('not.be.visible');

		cy.get('[title="View"]').click();
		cy.get('.tify-header-popup [title="Last page"]').click();
		cy.get('.tify-header-popup [title="Next page"]').should('be.disabled');
		cy.get('.tify-header-popup [title="Next section"]').should('be.disabled');
		cy.get('.tify-header-popup [title="Last page"]').should('be.disabled');

		cy.get('.tify-header-popup [title="Previous section"]').click();
		cy.contains(currentPage, '67 : -');
		cy.get('.tify-header').click();
		cy.get('.tify-header-popup').should('not.be.visible');
	});

	it('hides section buttons if there are less than 2 sections', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN140716181.json`);

		cy.contains('Von Gottes Gnaden');
		cy.contains('Previous section').should('not.exist');
		cy.contains('Next section').should('not.exist');
	});
});
