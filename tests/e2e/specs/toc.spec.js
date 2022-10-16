describe('TOC', () => {
	it('allows navigation', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081');

		cy.contains('Contents').click();
		cy.contains('Table of Contents');

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

		cy.contains('Collapse').click().then(() => {
			cy.contains('Ferrarische Methode (Louis Ferrari)').should('not.be.visible');
		});

		cy.get('.tify-toc > .tify-toc-list > :last-child .tify-toc-link').click().then(() => {
			cy.get('.tify-toc-structure.-current').contains('Einband');
		});

		cy.contains('Expand all').click().click().then(() => {
			// Multiple clicks should not toggle all children again
			cy.contains('Auflösung von Gleichungen 3ten Grades').should('be.visible');
			cy.contains('Recursionsformeln').should('be.visible');
		});

		cy.contains('Collapse all').click().click().then(() => {
			// Multiple clicks should not toggle all children again
			cy.contains('Auflösung von Gleichungen 3ten Grades').should('not.be.visible');
			cy.contains('Recursionsformeln').should('not.be.visible');
		});

		cy.contains('Expand all').click();

		// Collapse first collapsible
		cy.get('.tify-toc-structure[data-level="0"].-expanded:nth-child(3) > .tify-toc-toggle:first-of-type').click();

		// Child of first collapsible
		cy.contains('Auflösung von Gleichungen 3ten Grades').should('not.be.visible');

		// Child of second collapsible
		cy.contains('Recursionsformeln').should('be.visible');
	});

	it('is visible when there are structures without canvases', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'toc',
		}));

		cy.visit(`/?manifest=http://localhost:8081/manifest/cambridge-MS-ADD-08640&tify=${encodedParams}`);

		cy.contains('Table of Contents').should('be.visible');
		cy.get('.tify-toc-structure.-current').contains('Elizabeth Lyttelton\'s commonplace book');
	});
});
