describe('Fulltext', () => {
	it('displays fulltext and annotation overlays at the correct positions', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b18035723&tify={"pages":[14,15,16]}`);

		cy.contains('Fulltext').click();
		cy.contains('Alles höhere Leben - ob Tier oder').should('be.visible');

		cy.get('.tify-scan-overlay').should('have.length', 102);

		// Check the first annotation overlay of each page
		cy.get('[style*="left: 18.8775px; top: 282.193px"]')
			.children('.tify-scan-overlay[style*="width: 114.079px; height: 5.04485px"]');
		cy.get('[style*="left: 413.198px; top: 282.193px"]')
			.children('.tify-scan-overlay[style*="width: 114.079px; height: 5.04485px"]');
		cy.get('[style*="left: 807.519px; top: 282.193px"]')
			.children('.tify-scan-overlay[style*="width: 114.079px; height: 5.04485px"]');
	});

	it('loads and displays an annotation list', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/harvard-art-museum-299843`);

		cy.get('[title="Toggle annotations"]').should('not.exist');

		cy.contains('Fulltext').click();

		cy.get('[title="Toggle annotations"]').click();
		cy.get('.tify-scan-overlay').should('not.exist');
		cy.get('[title="Toggle annotations"]').click();
		cy.get('.tify-scan-overlay').should('have.length', 5);

		cy.contains('.tify-fulltext-toggle', 'Painting');
		cy.contains('.tify-fulltext-toggle', 'Person');
	});

	it('displays XML fulltext', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN235181684_0029&tify={"view":"fulltext"}`);

		cy.contains('Unter Mitwirkung der Herren').should('be.visible');
	});

	it('highlights the corresponding fulltext section when an overlay is clicked and vice versa', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b18035723&tify={"view":"fulltext"}`);

		cy.get('.tify-scan-overlay:eq(22)').click();
		cy.get('.tify-scan-overlay:eq(22)').should('have.class', '-current');
		cy.contains('.tify-fulltext-item.-current', 'näher kommen');
	});

	// TODO: Split this up, one test per recipe
	it('correctly displays manifests from the IIIF cookbook', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/cookbook-recipe-0019-html-in-annotations`
			+ '&tify={"view":"fulltext"}',
		);
		cy.contains('.tify-fulltext-toggle', 'Gänseliesel Brunnen');

		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/cookbook-recipe-0021-tagging`
			+ '&tify={"view":"fulltext"}',
		);
		cy.contains('Gänseliesel-Brunnen').click();
		cy.get('.tify-scan-overlay').should('have.length', 1).should('have.class', '-current');

		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/cookbook-recipe-0266-full-canvas-annotation`
			+ '&tify={"view":"fulltext"}',
		);
		cy.get('.tify-scan-overlay').should('not.exist');
	});

	it('displays images in annotations', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/cookbook-recipe-0377-image-in-annotation`
			+ '&tify={"view":"fulltext"}',
		);

		cy.get('.tify-fulltext img[src$="918ecd18c2592080851777620de9bcb5-fountain/full/300,/0/default.jpg"]');
		cy.contains('.tify-fulltext', 'Night picture of the Gänseliesel fountain');
	});
});
