describe('Configuration', () => {
	it('sets the available views', () => {
		cy.visit(
			`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/gdz-PPN857449303.json`,
			{
				onBeforeLoad: Cypress.tifyConfig({
					views: [
						'export',
						'info',
						'toc',
					],
				}),
			},
		);

		cy.contains('.tify-header-button:nth-child(2)', 'Export');
		cy.contains('.tify-header-button:nth-child(3)', 'Info');
		cy.contains('.tify-header-button:nth-child(4)', 'Contents');

		cy.get('.tify-header-button-group.-view:first-of-type .tify-header-button')
			.should('have.length', 4);
	});

	it('supports a single view', () => {
		cy.visit(
			`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/gdz-PPN857449303.json`,
			{
				onBeforeLoad: Cypress.tifyConfig({
					views: ['export'],
				}),
			},
		);

		cy.contains('.tify-header-button:nth-child(2)', 'Export');

		cy.get('.tify-header-button-group.-view:first-of-type .tify-header-button')
			.should('have.length', 2);
	});

	it('always shows media view regardless of views config', () => {
		cy.visit(
			`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/gdz-PPN857449303.json`,
			{
				onBeforeLoad: Cypress.tifyConfig({
					views: ['info'],
				}),
			},
		);

		cy.contains('.tify-header-button', 'Media').should('exist');
		cy.contains('.tify-header-button:nth-child(2)', 'Info');

		cy.get('.tify-header-button-group.-view:first-of-type .tify-header-button')
			.should('have.length', 2);
	});

	it('sets the page label format', () => {
		cy.visit(
			`/?manifest=${Cypress.expose('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`,
			{
				onBeforeLoad: Cypress.tifyConfig({
					pageLabelFormat: 'L (P) / T',
					view: 'thumbnails',
				}),
			},
		);

		cy.contains('.tify-thumbnails', '- (1) / 69');
		cy.contains('.tify-thumbnails', '- (2) / 69');
		cy.contains('.tify-thumbnails', '1r (3) / 69');
		cy.contains('.tify-thumbnails', '1v (4) / 69');
	});
});
