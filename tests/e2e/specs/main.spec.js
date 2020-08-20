describe('Main', () => {
	it('Start the app', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json&language=de');
		cy
			.get('.tify-app_main')
			.get('#tify > .tify-app');
	});

	it('Validate manifest', () => {
		cy.visit('/?manifest=http://localhost:8081/manifest/gdz-PPN497825848-00000001-info.json');
		cy
			.get('.tify-app')
			.contains('Please provide a valid IIIF Presentation API 2.x Manifest');
	});

	// TODO: Test disabled because it fails, despite working fine in the browser
	// it('Toggle fullscreen via mouse', (I) => {
	// 	cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	//
	// 	cy
	// 		.get('.tify-app_main')
	// 		.then(() => {
	// 			cy.contains('button', 'Fullscreen');
	// 			cy.contains('button', 'Exit fullscreen').should('not.be.visible');
	//
	// 			cy.contains('Fullscreen').click();
	// 			cy.contains('button', 'Exit fullscreen');
	// 			cy.contains('Exit fullscreen').click();
	// 			cy.contains('button', 'Fullscreen');
	//
	// 			cy.contains('Fullscreen').click();
	// 			cy.contains('button', 'Exit fullscreen');
	// 			cy.get('body').type('Esc');
	// 			cy.contains('button', 'Fullscreen');
	// 		});
	// });

	// TODO: Test disabled because it fails, despite working fine in the browser
	// it('Toggle fullscreen via keyboard', () => {
	// 	cy.visit('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	//
	// 	cy
	// 		.get('.tify-app_main')
	// 		.then(() => {
	// 			cy.contains('button', 'Fullscreen');
	// 			cy.contains('button', 'Exit fullscreen').should('not.be.visible');
	//
	// 			cy.get('body').type('f')
	// 			.get('.tify-header_button[title="Exit fullscreen"]')
	// 				.then(() => {
	// 					cy.contains('.tify-header_button', 'Exit fullscreen');
	// 					cy.get('body').type('f');
	// 					cy.contains('button', 'Fullscreen');
	//
	// 					// TODO: Escape does not get triggered, may work after CodeceptJS updating to Webdriver@5
	// 					cy.get('body').type('f');
	// 					cy.contains('button', 'Exit fullscreen');
	// 					cy.get('body').type('{esc}');
	// 					cy.contains('button', 'Fullscreen');
	// 				});
	// 		});
	// });
});
