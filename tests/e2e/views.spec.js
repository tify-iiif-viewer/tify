describe('Views', () => {
	it('changes the view via buttons', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			childManifestUrl: `${Cypress.env('iiifApiUrl')}/manifests/wellcome-b19974760_1_0004.json`,
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/wellcome-b19974760.json&tify=${encodedParams}`);

		cy.contains('Text').click();
		cy.contains('[aria-expanded="true"]', 'Text');

		cy.contains('Pages').click();
		cy.contains('[aria-expanded="true"]', 'Pages');

		cy.contains('Contents').click();
		cy.contains('[aria-expanded="true"]', 'Contents');

		cy.contains('Info').click();
		cy.contains('[aria-expanded="true"]', 'Info');

		cy.contains('Export').click();
		cy.contains('[aria-expanded="true"]', 'Export');

		cy.contains('.tify-header-button', 'Collection').click();
		cy.contains('[aria-expanded="true"]', 'Collection');

		cy.contains('Help').click();
		cy.contains('[aria-expanded="true"]', 'Help');
	});

	it('changes the view via keyboard', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			childManifestUrl: `${Cypress.env('iiifApiUrl')}/manifests/wellcome-b19974760_1_0004.json`,
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/wellcome-b19974760.json&tify=${encodedParams}`);

		cy.contains('The chemist and druggist');

		cy.get('.tify').type('1');
		cy.contains('[aria-expanded="true"]', 'Text');

		cy.get('.tify').type('2');
		cy.contains('[aria-expanded="true"]', 'Pages');

		cy.get('.tify').type('3');
		cy.contains('[aria-expanded="true"]', 'Contents');

		cy.get('.tify').type('4');
		cy.contains('[aria-expanded="true"]', 'Info');

		cy.get('.tify').type('5');
		cy.contains('[aria-expanded="true"]', 'Export');

		cy.get('.tify').type('6');
		cy.contains('[aria-expanded="true"]', 'Collection');

		cy.get('.tify').type('7');
		cy.contains('[aria-expanded="true"]', 'Help');
	});
});
