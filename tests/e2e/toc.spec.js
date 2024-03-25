describe('TOC', () => {
	it('allows navigation', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`;
		cy.visit(`/?manifest=${manifestUrl}`);

		cy.contains('Contents').click();
		cy.contains('Table of Contents');

		cy.contains('.tify-toc-toggle-all', 'Expand all');
		cy.contains('.tify-toc-toggle-all', 'Collapse all');

		cy.get('.tify-toc-structure.-current').contains('Titelseite');
		cy.get('.tify-toc-structure[data-level="0"]:nth-child(3) > .tify-toc-toggle').click();
		cy.get(
			'.tify-toc-structure[data-level="0"].-expanded'
				+ ' .tify-toc-structure[data-level="1"]:first-child > .tify-toc-toggle',
		).click();
		cy.get('.tify-toc-label').contains('Huddesche Methode');

		// "Kurze Nachrichten"
		cy.get('.tify-toc-structure[data-level="1"]:last-of-type > .tify-toc-toggle').click();
		cy.get('.tify-toc-label').contains('Ferrarische Methode (Louis Ferrari)');

		cy.contains('Collapse').click();
		cy.contains('Ferrarische Methode (Louis Ferrari)').should('not.be.visible');

		cy.get('.tify-toc > .tify-toc-list > :last-child .tify-toc-link').click();
		cy.get('.tify-toc-structure.-current').contains('Einband');

		// Multiple clicks should not toggle all children again
		Cypress._.times(2, () => cy.contains('Expand all').click());
		cy.contains('Auflösung von Gleichungen 3ten Grades').should('be.visible');
		cy.contains('Recursionsformeln').should('be.visible');

		// Multiple clicks should not toggle all children again
		Cypress._.times(2, () => cy.contains('Collapse all').click());
		cy.contains('Auflösung von Gleichungen 3ten Grades').should('not.be.visible');
		cy.contains('Recursionsformeln').should('not.be.visible');

		cy.contains('Expand all').click();

		// Collapse first collapsible
		cy.get('.tify-toc-structure[data-level="0"].-expanded:nth-child(3) > .tify-toc-toggle:first-of-type').click();

		// Child of first collapsible
		cy.contains('Auflösung von Gleichungen 3ten Grades').should('not.be.visible');

		// Child of second collapsible
		cy.contains('Recursionsformeln').should('be.visible');
	});

	it('is working even when structures are chaotic', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifest/cambridge-MS-ADD-08640`;
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'toc',
		}));

		cy.visit(`/?manifest=${manifestUrl}&tify=${encodedParams}`);

		cy.contains('.tify-toc-toggle-all').should('not.exist');

		cy.get('.tify-toc-structure.-current').contains('Elizabeth Lyttelton\'s commonplace book');
	});

	it('hides items if their "behavior" is "top"', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifest/digitale-sammlungen-bsb00026283`;
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'toc',
		}));

		cy.visit(`/?manifest=${manifestUrl}&tify=${encodedParams}`);

		cy.contains('Table of Contents').should('be.visible');
		cy.get('.tify-toc-structure:first-child')
			.should('not.contain', 'Table of Contents')
			.contains('Miniatur: Jesu Gebet in Gethsemane');
	});
});
