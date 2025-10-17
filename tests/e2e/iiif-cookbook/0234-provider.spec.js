describe('IIIF Cookbook 0234: Provider', () => {
	it('displays all provider information', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/iiif-cookbook/0234-provider/manifest.json`
			+ '&tify={"view":"info"}',
		);

		cy.contains(
			'.tify-info-section.-provider p',
			'UCLA Library',
		);
		cy.contains(
			'.tify-info-section.-provider a',
			'UCLA Library Digital Collections',
		);
		cy.contains(
			'.tify-info-section.-provider a[href$="n79055331.madsxml.xml"]',
			'US Library of Congress data about the UCLA Library',
		);
	});
});
