describe('Scan', () => {
	it('Use image filters', () => {
		const params = {
			filters: {
				saturate: 0,
			},
		};
		const encodedParams = encodeURIComponent(JSON.stringify(params));

		cy.visit(`/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);
		cy
			.get('.tify-app_main')
			.get('[title="Toggle image filters"]')
			.click()
			.get('label[for=tify-scan_saturation]')
			.contains('Saturation 0');
	});

	it('Reset pan, zoom, rotation and filters at once', () => {
		const params = {
			filters: {
				brightness: 1.1,
				contrast: 0.9,
				saturate: 1.1,
			},
			panX: .5,
			panY: .5,
			rotation: 90,
			zoom: 2,
		};
		const encodedParams = encodeURIComponent(JSON.stringify(params));

		cy.visit(`/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.contains('.tify-scan_button.-active', 'Rotate');
				cy.contains('.tify-scan_button.-active', 'Toggle image filters');
			});

		cy.get('body').type('{shift}0');
		cy.url().should('include', '/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify={%22view%22:%22info%22}');
	});

	it('Control scan via keyboard', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
		cy
			.get('.tify-app_main')
			.then(() => {
				cy.wait(1000);
				cy.get('body').type('r');
				cy.contains('.tify-scan_button.-active', 'Rotate').should('be.visible');

				cy.get('body').type('r');
				cy.get('body').type('r');
				cy.get('body').type('r');
				cy.contains('.tify-scan_button:not(.-active)', 'Rotate').should('be.visible');

				cy.get('body')
					.type('i')
					.contains('Brightness').should('be.visible')
					.type('i')
					.contains('Brightness').should('not.be.visible');

				cy.get('body')
					.type('i')
					.contains('Brightness').should('be.visible')
					.type('{esc}')
					.contains('Brightness').should('not.be.visible');
			});
	});
});
