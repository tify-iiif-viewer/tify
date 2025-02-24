describe('Scan', () => {
	it('uses image filters', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			filters: {
				saturate: 0,
			},
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081&tify=${encodedParams}`);
		cy.get('[title="Toggle image filters"]').click();
		cy.get('.tify-scan-filters-popup').contains('Saturation 0');
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

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081&tify=${encodedParams}`);

		cy.get('[title="Rotate"].-active');
		cy.get('[title="Toggle image filters"].-active');

		cy.get('.tify').type('{shift}0');
		cy.url().should(
			'include',
			`/?manifest=${encodeURIComponent(`${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`)}`,
		);
	});

	it('controls the scan via keyboard', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`);

		// Zoom
		cy.contains('Reset').should('be.disabled');
		cy.get('.tify').type('+');
		cy.get('[title="Reset"]').should('not.be.disabled');
		cy.get('.tify').type('+=W');
		cy.get('[title="Zoom in"]').should('be.disabled');
		cy.get('.tify').type('-');
		cy.get('[title="Zoom in"]').should('not.be.disabled');
		cy.get('.tify').type('-_S');
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
});
