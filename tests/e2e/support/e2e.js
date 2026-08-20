import 'cypress-html-validate/commands';

Cypress.on('window:before:load', (win) => {
	cy.spy(win.console, 'error');
});

afterEach(() => {
	if (cy.bypassAfterEach) {
		return;
	}

	cy.window().then((win) => {
		expect(win.console.error).to.have.callCount(0);
	});

	cy.htmlvalidate(
		{
			rules: {
				'heading-level': [
					'error',
					{
						allowMultipleH1: true,
					},
				],
				'long-title': 'off',
				'prefer-native-element': 'off',
				'require-sri': 'off',
				'valid-id': [
					'error',
					{
						relaxed: true,
					},
				],
			},
		},
		{
			exclude: [
				// Annotation overlays may contain duplicate IDs
				'.openseadragon-canvas',
				// Attribution may contain invalid HTML if the manifest provides such
				'.tify-info-section.-attribution',
			],
		},
	);
});
