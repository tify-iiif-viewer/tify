// TODO: Extend API tests

describe('API', () => {
	it('controls TIFY programmatically', () => {
		cy.visit(`/?manifest=${Cypress.env('iiifApiUrl')}/manifest/gdz-PPN857449303`);

		cy.window().its('tify').then((tify) => {
			tify.ready.then(() => {
				tify.viewer.viewport.zoomTo(2);
				cy.contains('Zoom in').should('be.disabled');

				tify.setLanguage('de');
				cy.contains('Seiten');

				tify.setPage(2);
				cy.contains('.tify-page-select-button', '2 : -');

				tify.setView('export');
				cy.contains('.-active', 'Export');

				tify.setLanguage('de');
				cy.contains('.tify-header-button', 'Seiten');
			});
		});
	});
});
