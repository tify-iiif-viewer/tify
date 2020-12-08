describe('TOC', () => {
	it('Navigate TOC', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.contains('Contents').click();
				cy.contains('Table of Contents');

				cy.get('.tify-toc_structure.-current').contains('Titelseite');
				cy.get('.tify-toc_structure[data-level="0"]:nth-child(3) > .tify-toc_toggle').click();
				// eslint-disable-next-line max-len
				cy.get('.tify-toc_structure[data-level="0"].-expanded .tify-toc_structure[data-level="1"]:first-child > .tify-toc_toggle').click();
				cy.get('.tify-toc_label').contains('Huddesche Methode');

				// "Kurze Nachrichten"
				cy.get('.tify-toc_structure[data-level="1"]:last-of-type > .tify-toc_toggle').click();
				cy.get('.tify-toc_label').contains('Ferrarische Methode (Louis Ferrari)');

				cy.contains('Collapse').click().then(() => {
					cy.contains('Ferrarische Methode (Louis Ferrari)').should('not.be.visible');
				});

				cy.get('.tify-toc > .tify-toc_list > :last-child .tify-toc_link').click().then(() => {
					cy.get('.tify-toc_structure.-current').contains('Einband');
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

				cy
					.contains('Expand all')
					.click()
					.get(
						'.tify-toc_structure[data-level="0"].-expanded:nth-child(3) > .tify-toc_toggle:first-of-type',
					) // collapse first collapsible
					.click()
					.then(() => {
						// eslint-disable-next-line max-len
						cy.contains('Auflösung von Gleichungen 3ten Grades').should('not.be.visible'); // child of first collapsible
						cy.contains('Recursionsformeln').should('be.visible'); // child of second collapsible
					});
			});
	});

	it('Show TOC when there are structures without canvases', () => {
		const params = {
			view: 'toc',
		};
		const encodedParams = encodeURIComponent(JSON.stringify(params));

		cy.visit(`/?manifest=http://localhost:8081/manifest/MS-ADD-08640.json&tify=${encodedParams}`);
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.contains('Table of Contents').should('be.visible');
				cy.get('.tify-toc_structure.-current').contains('Elizabeth Lyttelton\'s commonplace book');
			});
	});
});
