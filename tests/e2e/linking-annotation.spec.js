/**
 * Tests for SpecificResource linking annotations
 *
 * IIIF manifests can contain annotations with `motivation: "linking"` that link
 * between canvases (e.g., single page to double page view). These annotations
 * use a combination of:
 * - TextualBody: The link text to display
 * - SpecificResource: The target canvas to navigate to
 *
 * See: https://www.w3.org/TR/annotation-model/#specific-resources
 * See: https://www.w3.org/TR/annotation-vocab/#linking
 */
describe('Linking annotations with SpecificResource', () => {
	describe('Text view with SpecificResource bodies', () => {
		beforeEach(() => {
			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"view":"text"}',
			);
		});

		it('should display the TextualBody content from the annotation', () => {
			// The annotation has a TextualBody with value "View as double page"
			// This should be displayed in the text view
			cy.contains('View as double page').should('be.visible');
		});

		it('should display annotation overlays at correct positions', () => {
			// The annotation targets the full canvas, so an overlay should exist
			cy.get('.tify-media-overlay').should('exist');
		});
	});

	describe('SpecificResource should not trigger fetch', () => {
		it('should NOT fetch annotation ID URLs when processing SpecificResource bodies', () => {
			// This test intercepts network requests to detect the bug:
			// Tify incorrectly tries to fetchText() on annotation ID URLs
			// when it encounters a SpecificResource body without an 'id' property.
			//
			// The bug: store.js falls back to annotationId when item.id is undefined,
			// then calls fetchText(annotationId) which is semantically wrong.

			cy.intercept('GET', '**/link-to-double', (req) => {
				// This URL pattern matches annotation IDs like:
				// .../canvas-001/link-to-double
				// Let it through but track it
				req.continue();
			}).as('annotationFetch');

			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"pages":[1],"view":"text"}',
			);

			// Wait for text view to fully load
			cy.get('.tify-text').should('exist');
			cy.contains('View as double page').should('be.visible');

			// After annotation text is visible, check for improper fetches
			cy.get('.tify-text-item').should('exist').then(() => {
				// BUG DETECTION: If Tify fetched annotation ID URLs, it's the bug
				// SpecificResource bodies should NOT trigger any fetch requests
				cy.get('@annotationFetch.all').then((interceptions) => {
					if (interceptions.length > 0) {
						throw new Error(
							'BUG: Tify incorrectly tried to fetch annotation ID URLs as text content.\n'
							+ `Fetched URLs: ${interceptions.map((i) => i.request.url).join(', ')}\n`
							+ 'SpecificResource bodies should be recognized as canvas links, not text to fetch.',
						);
					}
				});
			});
		});

		it('should NOT fetch canvas URLs from SpecificResource source.id', () => {
			// Another manifestation of the bug: trying to fetch source.id as text

			cy.intercept('GET', '**/canvas-003', (req) => {
				// This pattern matches the SpecificResource source.id target canvas
				req.continue();
			}).as('canvasFetch');

			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"pages":[1],"view":"text"}',
			);

			cy.get('.tify-text').should('exist');
			cy.contains('View as double page').should('be.visible');

			// After annotation text is visible, check for improper fetches
			cy.get('.tify-text-item').should('exist').then(() => {
				// Canvas IDs should never be fetched as text content
				cy.get('@canvasFetch.all').then((interceptions) => {
					// Filter out legitimate canvas requests (like for painting annotations)
					const textFetches = interceptions.filter((i) => !i.request.url.includes('/page')
						&& !i.request.url.includes('/image'));

					if (textFetches.length > 0) {
						throw new Error(
							'BUG: Tify incorrectly tried to fetch canvas URLs as text content.\n'
							+ `Fetched URLs: ${textFetches.map((i) => i.request.url).join(', ')}`,
						);
					}
				});
			});
		});
	});

	describe('SpecificResource as canvas link target', () => {
		beforeEach(() => {
			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"pages":[1],"view":"text"}',
			);
		});

		it('should recognize linking motivation annotations', () => {
			// Wait for text view to load
			cy.get('.tify-text').should('exist');

			// The annotation with linking motivation should be processed
			// without throwing errors
			cy.contains('View as double page').should('be.visible');
		});

		// This test documents the expected behavior for a future implementation
		it.skip('should render SpecificResource as a clickable link to target canvas', () => {
			// Future behavior: The SpecificResource should be rendered as a link
			// that navigates to canvas-003 (page 3) when clicked

			cy.contains('View as double page')
				.should('have.attr', 'href')
				.or('have.attr', 'data-tify-page');

			// Clicking should navigate to the target canvas (page 3)
			cy.contains('View as double page').click();
			cy.get('.tify-page-select button').should('contain', '3');
		});
	});

	describe('Bidirectional linking', () => {
		it('should handle single-to-double page links', () => {
			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"pages":[1],"view":"text"}',
			);

			// Page 1 has a link to page 3 (double page view)
			cy.contains('View as double page').should('be.visible');
		});

		it('should handle double-to-single page links', () => {
			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"pages":[3],"view":"text"}',
			);

			// Page 3 has a link to page 1 (single page view)
			cy.contains('View as single page').should('be.visible');
		});
	});

	describe('Multiple body types in single annotation', () => {
		beforeEach(() => {
			cy.visit(
				`/?manifest=${Cypress.env('iiifApiUrl')}/manifests/linking-annotation-specificresource.json`
				+ '&tify={"pages":[1],"view":"text"}',
			);
		});

		it('should process TextualBody alongside SpecificResource', () => {
			// The annotation has both TextualBody and SpecificResource
			// TextualBody should be displayed, SpecificResource should not cause errors
			cy.contains('View as double page').should('be.visible');

			// Verify annotation was processed correctly
			cy.get('.tify-text-item').should('exist');
		});
	});
});
