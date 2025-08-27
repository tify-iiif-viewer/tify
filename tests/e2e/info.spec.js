describe('Info', () => {
	it('displays related metadata', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/wellcome-b18035723.json`);
		cy.contains('Info').click();
		cy.should('not.contain', 'Provided by');
		cy.contains('Wunder der Vererbung / von Fritz Bolle.');

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/ubl-0000000001.json`);
		cy.contains('Info').click();
		cy.should('not.contain', 'Provided by');
		cy.contains('/object/viewid/0000000001');
		cy.contains('/0000000001/manifest');

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/digitale-sammlungen-bsb00026283.json`);
		cy.contains('Info').click();
		cy.get('.tify-info-section.-related li').should('have.length', 2);
		cy.get('a[href$="/details:bsb00026283"]').contains('Details');
		cy.get('a[href$="/title/BV023398264"]').contains('OPAC');
	});

	it('collapses long metadata values', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-HANS_DE_7_w042081.json`);
		cy.contains('button', 'Expand');
	});

	it('shows metadata of the current structure', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN857449303.json`);

		cy.contains('Info').click();
		cy.contains('.tify-info', 'Current Section').should('be.visible');
		cy.contains('.tify-info', 'Titelseite');

		cy.get('[title="Toggle double-page"]').click();
		cy.get('[title="Last page"]').first().click();
		cy.contains('Current Section').should('not.exist');
	});

	it('shows metadata of a nested structure', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-DE_611_BF_5619_1801_1806.json`);

		cy.get('[title="Toggle double-page"]').click();

		cy.contains('Info').click();
		Cypress._.times(4, () => cy.get('[title="Next page"]').first().click());
		cy.contains('.tify-info', 'Current Section').should('be.visible');
		cy.contains(
			'.tify-info-section.-metadata.-structure',
			'[Brief des Barons von Asch an Heyne vom 29.01./10.02.1801]',
		);
	});

	it('displays all provider information', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/wellcome-b24738918.json`);
		cy.contains('Info').click();

		cy.fixture('../../iiif-api/data/manifests/wellcome-b24738918.json').then((manifest) => {
			const nbsp = '\u00A0';
			const separator = `${nbsp}· `;
			const providerStringWithoutUrl = manifest.provider[0].label.en.slice(0, -1).join(separator);
			cy.get('.tify-info-section.-provider p').should('contain.text', providerStringWithoutUrl);
		});
	});

	it('only displays a related homepage once for converted IIIF 2 manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/gdz-PPN140716181.json`);
		cy.contains('Info').click();
		cy.get('.tify-info-section.-related a[href$="/DB=1/PPN?PPN=140716181"]').contains('OPAC');
		cy.get('.tify-info-section.-provider').should('not.exist');
	});

	// TODO: Add test for manifests/biblhertz-garofalo-ligorio-comparison.json
	// Check image labels in info view
});
