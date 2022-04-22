describe('Scan', () => {
	it('Use image filters', () => {
		const params = {
			filters: {
				saturate: 0,
			},
		};
		const encodedParams = encodeURIComponent(JSON.stringify(params));

		cy.visit(`/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);
		cy.get('[title="Toggle image filters"]')
			.click()
			.get('.tify-scan-filters-popup')
			.contains('Saturation 0');
	});

	it('Reset pan, zoom, rotation and filters at once', () => {
		const params = {
			filters: {
				brightness: 1.1,
				contrast: 0.9,
				saturate: 1.1,
			},
			pan: {
				x: .5,
				y: .5,
			},
			rotation: 90,
			zoom: 2,
		};
		const encodedParams = encodeURIComponent(JSON.stringify(params));

		cy.visit(`/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);
		cy.get('.tify').then(() => {
			cy.get('[title="Rotate"].-active');
			cy.get('[title="Toggle image filters"].-active');
		});

		cy.get('.tify').type('{shift}0');
		cy.url().should(
			'include',
			`/?manifest=${encodeURIComponent('http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json')}`
				+ `&tify=${encodeURIComponent('{"view":""}')}`,
		);
	});

	it('Control scan via keyboard', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
		cy.get('.tify').then(() => {
			cy.wait(500); // eslint-disable-line cypress/no-unnecessary-waiting
			cy.get('.tify').type('r');
			cy.get('[title="Rotate"].-active').should('be.visible');

			cy.get('.tify').type('r');
			cy.get('.tify').type('r');
			cy.get('.tify').type('r');
			cy.get('[title="Rotate"]:not(.-active)').should('be.visible');

			cy.get('.tify').type('i')
				.contains('Brightness').should('be.visible')
				.type('i')
				.contains('Brightness')
				.should('not.be.visible');

			cy.get('.tify').type('i')
				.contains('Brightness').should('be.visible')
				.type('{esc}')
				.contains('Brightness')
				.should('not.be.visible');
		});
	});
});
