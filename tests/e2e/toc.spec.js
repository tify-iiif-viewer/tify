describe('TOC', () => {
	it('allows navigation', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`;
		cy.visit(`/?manifest=${manifestUrl}`);

		cy.contains('Contents').click();
		cy.contains('Table of Contents');

		cy.contains('.tify-toc-toggle-all', 'Expand all');
		cy.contains('.tify-toc-toggle-all', 'Collapse all');

		// NOTE: Export panel also contains TOC structures, so we need to set a
		// parent class for some selectors.

		cy.get('.tify-toc-structure.-current').contains('Titelseite');
		cy.get(
			'.tify-toc'
			+ ' .tify-toc-structure:nth-child(3) > .tify-toc-toggle',
		).click();
		cy.get(
			'.tify-toc'
			+ ' .tify-toc-structure.-expanded'
			+ ' .tify-toc-structure:first-child > .tify-toc-toggle',
		).click();
		cy.get('.tify-toc-label').contains('Huddesche Methode');

		// "Kurze Nachrichten"
		cy.get(
			'.tify-toc'
			+ ' .tify-toc-structure:eq(2) > .tify-toc-toggle',
		).click();
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
		cy.get('.tify-toc-structure.-expanded:nth-child(3) > .tify-toc-toggle:first-of-type').click();

		// Child of first collapsible
		cy.contains('Auflösung von Gleichungen 3ten Grades').should('not.be.visible');

		// Child of second collapsible
		cy.contains('Recursionsformeln').should('be.visible');
	});

	it('highlights all current levels', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`;
		cy.visit(`/?manifest=${manifestUrl}`);

		cy.contains('Contents').click();

		cy.contains('Expand all').click();

		cy.contains('Discriminante R').click();
		cy.get('.tify-toc .tify-toc-structure.-current').should('have.length', 4);
	});

	it('is working even when structures are chaotic', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/cambridge-MS-ADD-08640.json`;
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'toc',
			pages: [4],
		}));

		cy.visit(`/?manifest=${manifestUrl}&tify=${encodedParams}`);

		cy.get('.tify-toc .tify-toc-structure.-current').contains('Elizabeth Lyttelton\'s commonplace book');
	});

	it('hides items if their "behavior" is "top"', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/digitale-sammlungen-bsb00026283.json`;
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'toc',
		}));

		cy.visit(`/?manifest=${manifestUrl}&tify=${encodedParams}`);

		cy.contains('Table of Contents').should('be.visible');
		cy.get('.tify-toc-structure:first-child')
			.should('not.contain', 'Table of Contents')
			.contains('Miniatur: Jesu Gebet in Gethsemane');
	});

	it('hides the whole TOC if there are no structures', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/aku-pal-375.json`;

		cy.visit(`/?manifest=${manifestUrl}`);

		cy.get('.tify-header');
		cy.contains('Contents').should('not.exist');
		cy.get('.tify-toc').should('not.exist');
	});

	it('displays page labels instead of structure labels if the latter are missing', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/bodleian-faeff7fb-f8a7-44b5-95ed-cff9a9ffd198.json`;
		const encodedParams = encodeURIComponent(JSON.stringify({
			view: 'toc',
		}));

		cy.visit(`/?manifest=${manifestUrl}&tify=${encodedParams}`);

		cy.contains('.tify-toc-list', 'Upper cover');
		cy.contains('.tify-toc-list', 'fol. 1r');
	});

	it('auto-expands a single top-level structure', () => {
		const manifestUrl = `${Cypress.env('iiifApiUrl')}/manifests/cambridge-MS-ADD-08640.json`;

		cy.visit(`/?manifest=${manifestUrl}`);

		cy.contains('Contents').click();

		cy.get('.tify-toc-structure.-expanded').contains('Elizabeth Lyttelton\'s commonplace book');
		cy.contains('whateuer Praises are or haue been due2'); // NOTE: Line break before "2" is omitted
	});
});
