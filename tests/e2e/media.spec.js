describe('Media', () => {
	it('uses image filters', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			filters: {
				saturate: 0,
			},
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);
		cy.get('[title="Toggle image filters"]').click();
		cy.get('.tify-media-dropdown').contains('Saturation 0');
	});

	it('resets pan, zoom, rotation and filters at once', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			filters: {
				brightness: 1.1,
				contrast: 0.9,
				saturate: 1.1,
			},
			pan: {
				x: 0.5,
				y: 0.5,
			},
			rotation: 90,
			zoom: 2,
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);

		cy.get('[title="Rotate"].-active');
		cy.get('.tify-dropdown.-active [title="Toggle image filters"]');

		cy.get('.tify').type('{shift}0');
		cy.url().should(
			'include',
			`/?manifest=${encodeURIComponent(`${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`)}`,
		);
	});

	it('controls the image via keyboard', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`);

		// Zoom
		cy.contains('Reset').should('be.disabled');
		cy.get('.tify').type('+');
		cy.get('[title="Reset"]').should('not.be.disabled');
		cy.get('.tify').type('+=WWW');
		cy.get('[title="Zoom in"]').should('be.disabled');
		cy.get('.tify').type('-');
		cy.get('[title="Zoom in"]').should('not.be.disabled');
		cy.get('.tify').type('-_SSS');
		cy.get('[title="Zoom out"]').should('be.disabled');

		// Pan
		cy.get('.tify').type('0', { delay: 500 });
		cy.get('[title="Reset"]').should('be.disabled');
		cy.get('.tify').type('wd');
		cy.get('[title="Reset"]').should('not.be.disabled');
		cy.get('.tify').type('sa');
		cy.get('[title="Reset"]').should('be.disabled');

		// Rotate
		cy.get('.tify').type('r');
		cy.get('[title="Rotate"].-active').should('be.visible');
		cy.get('.tify').type('r');
		cy.get('.tify').type('r');
		cy.get('.tify').type('r');
		cy.get('[title="Rotate"]:not(.-active)').should('be.visible');

		// Filter
		cy.get('.tify').type('i');
		cy.contains('Brightness').should('be.visible')
			.type('i');
		cy.contains('Brightness').should('not.be.visible');
		cy.get('.tify').type('i');
		cy.contains('Brightness').should('be.visible')
			.type('{esc}');
		cy.contains('Brightness').should('not.be.visible');
	});

	it('shows only usable pagination buttons', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`);

		cy.get('.tify-media-button.-left').should('not.exist');
		cy.get('.tify-media-button.-right');

		cy.get('[title="Last page"]:visible').click();

		cy.get('.tify-media-button.-left');
		cy.get('.tify-media-button.-right').should('not.exist');
	});
});
