describe('IIIF Cookbook 0010: Viewing direction', () => {
	it('supports right-to-left manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0010-book-2-viewing-direction/manifest-rtl.json`);
		cy.contains('header', 'front cover');

		cy.get('header [title="Next page"]:visible').click();
		cy.contains('header', 'pages 1–2'); // That’s an n-dash

		cy.get('.tify-media-button.-left[title="Next page"]').click();
		cy.contains('header', 'pages 3–4');

		cy.get('header [title="Last page"]:visible').click();
		cy.contains('header', 'back cover');

		// Buttons should be vertically mirrored
		cy.get('.tify-header-button-group.-pagination')
			.should('have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)');
	});

	it('supports top-to-bottom manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0010-book-2-viewing-direction/manifest-ttb.json`);
		cy.contains('header', 'image 1');

		cy.get('header [title="Next page"]:visible').click();
		cy.contains('header', 'image 2');

		cy.get('.tify-media-button.-bottom[title="Next page"]').click();
		cy.contains('header', 'image 3');

		cy.get('.tify-media-button.-top[title="Previous page"]').click();
		cy.contains('header', 'image 2');

		// Icons should be rotated 90deg
		cy.get('.tify-header-button-group.-pagination svg, [title="Toggle double-page"] svg')
			.should('have.css', 'transform', 'matrix(0, 1, -1, 0, 0, 0)');
	});
});
