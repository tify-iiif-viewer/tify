describe('Text (annotations)', () => {
	it('displays annotations and overlays at the correct positions', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/wellcome-b18035723.json&tify={"pages":[14,15,16]}`);

		cy.contains('Text').click();
		cy.contains('Alles höhere Leben - ob Tier oder').should('be.visible');

		cy.get('.tify-media-overlay').should('have.length', 102);

		// TODO: Test first page in double-page mode

		// Check the first annotation overlay of each page
		cy.get('[style*="left: 8.79344px; top: 209.845px"]')
			.children('.tify-media-overlay[style*="width: 53.1397px; height: 2.34997px"]');
		cy.get('[style*="left: 193.089px; top: 209.845px"]')
			.children('.tify-media-overlay[style*="width: 53.1397px; height: 2.34997px"]');
		cy.get('[style*="left: 377.384px; top: 209.845px"]')
			.children('.tify-media-overlay[style*="width: 53.1397px; height: 2.34997px"]');
	});

	it('loads and displays an annotation list', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/harvard-art-museum-299843.json`);

		cy.get('[title="Toggle annotations"]').should('not.exist');

		cy.contains('Text').click();

		cy.get('[title="Toggle annotations"]').click();
		cy.get('.tify-media-overlay').should('have.length', 5).should('not.be.visible');
		cy.get('[title="Toggle annotations"]').click();
		cy.get('.tify-media-overlay').should('have.length', 5).should('be.visible');

		cy.contains('.tify-text-toggle', 'Painting');
		cy.contains('.tify-text-toggle', 'Person');
	});

	it('displays XML annotations', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN235181684_0029.json&tify={"view":"text"}`);

		cy.contains('Unter Mitwirkung der Herren').should('be.visible');
	});

	it('highlights the corresponding text when an overlay is clicked and vice versa', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/wellcome-b18035723.json&tify={"view":"text"}`);

		cy.get('.tify-media-overlay:eq(22)').click();
		cy.get('.tify-media-overlay:eq(22)').should('have.class', '-current');
		cy.contains('.tify-text-item.-current', 'näher kommen');
	});

	// TODO: Add test for manifests/biblhertz-garofalo-ligorio-comparison.json
	// Check annotation overlay positions
});
