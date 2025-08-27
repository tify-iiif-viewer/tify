describe('Support for native IIIF 3 manifests', () => {
	it('displays correct metadata', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/aku-pal-375.json`
			+ '&tify={"view":"info"}',
		);

		cy.contains('h1', 'Dipinto Assiut, Gebel Assiut al-gharbi, N13.1 TN2');
		cy.contains('a', 'AKU-PAL database record');
	});

	it('displays the TOC', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/amherst-63cc6105-570d-407b-af8c-07fda3f8c620.json`
			+ '&tify={"view":"toc"}',
		);

		cy.get('.tify-toc-structure.-current:not(.-expanded)');
		cy.contains('.tify-toc-link', 'Transcription of Emily Dickinson\'s "I\'ll clutch - and clutch" - Image 3');
		cy.get('.tify-toc-link').should('have.length', 1);
	});

	it('displays attribution HTML', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/mskgent-8210.json`
			+ '&tify={"view":"info"}',
		);

		cy.get('.tify-info-section.-attribution').find('img'); // logo in attribution section
	});

	it('displays a dash for metadata with an empty value', () => {
		cy.visit(
			`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/utrecht-1874-325480.json`
			+ '&tify={"view":"info"}',
		);

		cy.contains('h4', 'Published').next().should('have.text', '‒' /* $n/a = figure dash */);
	});
});
