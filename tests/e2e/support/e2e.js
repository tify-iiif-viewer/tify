// eslint-disable-next-line import/no-extraneous-dependencies
import 'cypress-html-validate/commands';

afterEach(() => {
	if (cy.bypassAfterEach) {
		return;
	}

	cy.htmlvalidate(
		{
			rules: {
				'heading-level': [
					'error',
					{
						allowMultipleH1: true,
					},
				],
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
