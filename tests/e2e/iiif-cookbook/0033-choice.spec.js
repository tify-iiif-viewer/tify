describe('IIIF Cookbook 0033: Multiple choice of images in a single view (canvas)', () => {
	it('can switch layers with the layers button', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0033-choice/manifest.json`);

		cy.contains('John Dee performing an experiment before Queen Elizabeth I.');

		cy.get('[title="Toggle image layer select"]')
			.click();

		cy.contains('[aria-pressed=true]', 'Natural Light')
		cy.contains('[aria-pressed=false]', 'X-Ray')
			.click()

		cy.get('.tify-media-dropdown.-layers.-active > button')
			.click()

		cy.contains('[aria-pressed=false]', 'Natural Light')
		cy.contains('[aria-pressed=true]', 'X-Ray')
	});

	it('remembers the selected layer', () => {
		const encodedParams = encodeURIComponent(JSON.stringify({
			layers: [1],
		}));

		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0033-choice/manifest.json&tify=${encodedParams}`);

		cy.get('.tify-media-dropdown.-layers.-active > button')
			.click()

		cy.contains('[aria-pressed=false]', 'Natural Light')
		cy.contains('[aria-pressed=true]', 'X-Ray')
	});
});
