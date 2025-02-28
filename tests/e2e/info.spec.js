describe('Info', () => {
	it('displays related metadata', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b18035723`);
		cy.contains('Info').click();
		cy.contains('Related Resources');
		cy.contains('Wunder der Vererbung / von Fritz Bolle.');

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/ubl-0000000001`);
		cy.contains('Info').click();
		cy.contains('Related Resources');
		cy.contains('/object/viewid/0000000001');
		cy.contains('/0000000001/manifest');

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/digitale-sammlungen-bsb00026283`);
		cy.contains('Info').click();
		cy.get('.tify-info-section.-related li').should('have.length', 2);
		cy.get('a[href$="/details:bsb00026283"]').contains('Details');
		cy.get('a[href$="/title/BV023398264"]').contains('OPAC');
	});

	it('collapses long metadata values', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-HANS_DE_7_w042081`);
		cy.contains('button', 'Expand');
	});

	it('shows metadata of the current structure', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN857449303`);
		cy.contains('Info').click();
		cy.contains('Current Element').should('be.visible');
		cy.contains('Titelseite');

		cy.get('[title="Last page"]').first().click();
		cy.contains('Current Element').should('not.exist');
	});

	it('shows metadata of a nested structure', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-DE_611_BF_5619_1801_1806`);
		cy.contains('Info').click();
		Cypress._.times(4, () => cy.get('[title="Next page"]').first().click());
		cy.contains('Current Element').should('be.visible');
		cy.contains(
			'.tify-info-section.-metadata.-structure',
			'[Brief des Barons von Asch an Heyne vom 29.01./10.02.1801]',
		);
	});

	it('displays all provider information', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/wellcome-b24738918`);
		cy.contains('Info').click();

		cy.fixture('../../iiif-api/data/manifests/wellcome-b24738918.json').then((manifest) => {
			const provider = manifest.provider[0];
			const providerStringWithoutUrl = provider.label.en.slice(0, -1).join('');
			cy.get('.tify-info-section.-provider').should('contain.text', providerStringWithoutUrl);
			cy.contains('.tify-info-section.-provider a', provider.homepage[0].label.en.join(''));
		});
	});

	it('only displays a related homepage once for converted IIIF 2 manifests', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN140716181`);
		cy.contains('Info').click();
		cy.get('.tify-info-section.-related a[href$="/DB=1/PPN?PPN=140716181"]')
			.contains('OPAC');
		cy.get('.tify-info-section.-provider').contains('OPAC').should('not.exist');
	});
});
