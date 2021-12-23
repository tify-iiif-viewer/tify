describe('Pagination', () => {
	const currentPage = '.tify-page-select_button';

	it('Change page via buttons', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify={"pages":[15]}');
		cy.get('.tify-app_main').then(() => {
			cy.contains(currentPage, '15 : 7r');

			cy.get('[title="First page"]').first().click();
			cy.contains(currentPage, '1 :  -');

			cy.get('[title="Next page"]').first().click().click();
			cy.contains(currentPage, '3 : 1r');

			cy.get('[title="Next section"]').first().click().click();
			cy.contains(currentPage, '7 : 3r');

			cy.get('[title="Last page"]').first().click();
			cy.contains(currentPage, '69 :  -');

			cy.get('[title="Previous section"]').first()
				.click()
				.click()
				.click()
				.click();
			cy.contains('16 : 7v');

			cy.get('[title="Toggle double-page"]').first().click();
			cy.get('[title="Toggle double-page"].-active');
		});
	});

	it('Change page via keyboard', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify={"pages":[15]}');
		cy.get('.tify-app_main').then(() => {
			cy.contains(currentPage, '15 : 7r');

			cy.get('.tify-app_main').type('q');
			cy.contains(currentPage, '14 : 6v');
			cy.get('.tify-app_main').type('e');
			cy.contains(currentPage, '15 : 7r');

			cy.get('.tify-app_main').type('b');
			cy.contains(currentPage, '14 : 6v');
			cy.contains('.-active', 'Toggle double-page');

			cy.get('.tify-app_main').type('q');
			cy.contains(currentPage, '12 : 5v');
			cy.get('.tify-app_main').type(',');
			cy.contains(currentPage, '10 : 4v');

			cy.get('.tify-app_main').type('e');
			cy.contains(currentPage, '12 : 5v');
			cy.get('.tify-app_main').type('.');
			cy.contains(currentPage, '14 : 6v');

			cy.get('.tify-app_main').type('Q');
			cy.contains(currentPage, '1 :  -');

			cy.get('.tify-app_main').type('E');
			cy.contains(currentPage, '68 :  -');

			cy.get('.tify-app_main').type('b');
			cy.contains(currentPage, '68 :  -');
			cy.get('[title="Toggle double-page"]:not(.-active)');

			cy.get('.tify-app_main').type('Q');
			cy.contains(currentPage, '1 :  -');

			cy.get('.tify-app_main').type('E');
			cy.contains(currentPage, '69 :  -');
		});
	});

	it('Highlights the current page after a page change', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
		cy.get('[title="Last page"]').first().click();
		cy.get('[aria-label="Current page"]').first().click();
		cy.contains('.-current.-highlighted', '69 :  -');
	});
});
