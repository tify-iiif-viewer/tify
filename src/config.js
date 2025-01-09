export default {
	/**
	 * The ID of the annotation to highlight when the fulltext view is active.
	 * Only has effect for manifests with annotations.
	 *
	 * @type {?string}
	 */
	annotationId: null,

	/**
	 * When the fulltext view is active (or just the scan view on small screens),
	 * TIFY displays clickable annotation overlays on the scan, which are linked
	 * to their corresponding fulltext section. Set to `false` to hide overlays
	 * by default. Annotation overlays can always be toggled by the user. Only
	 * has effect for manifests with annotations.
	 *
	 * @type {?boolean}
	 */
	annotationsVisible: null,

	/**
	 * Breakpoints used for custom media queries, depending on TIFY’s container
	 * size instead of the viewport.
	 *
	 * @type {object}
	 */
	breakpoints: {
		tiny: 359,
		small: 719,
		medium: 959,
		large: 1199,
	},

	/**
	 * If the manifest set by `manifestUrl` is a collection (`@type` is
	 * `sc:Collection`) and `childManifestUrl` is not set, automatically load the
	 * first manifest in the collection. This only works for collections with
	 * `manifests` on the first level; when the collection only contains other
	 * collections and `childManifestUrl` is not set, only the collection view is
	 * shown until the user selects a child manifest to load.
	 *
	 * @type {boolean}
	 */
	childManifestAutoloaded: true,

	/**
	 * If the manifest set by `manifestUrl` is a collection (`@type` is
	 * `sc:Collection`), additionally load another IIIF manifest, whose `@type`
	 * must be `sc:Manifest`. Note that TIFY does not check if this additional
	 * manifest is actually part of the collection.
	 *
	 * @type {?string}
	 */
	childManifestUrl: null,

	/**
	 * The HTML element into which TIFY is mounted. If set to `null`, TIFY is not
	 * mounted at all until `mount` is called (see docs/api.md).
	 *
	 * @type {?string|HTMLElement}
	 */
	container: null,

	/**
	 * The language to be used for strings from the IIIF manifest that are not
	 * available in the current `language`. If no value matches `language` or
	 * `fallbackLanguage`, the first available language is displayed.
	 *
	 * @type {string}
	 */
	fallbackLanguage: 'en',

	/**
	 * Sets the initial image filters. Available properties are `'brightness'`,
	 * `'contrast'` (both a floating-point number between `0.5` and `2`) and
	 * `'saturation'` (floating-point number between `0` and `3`), all optional.
	 *
	 * @type {object}
	 */
	filters: {},

	/**
	 * The interface language, matching the translation filename without
	 * extension. See which translations are available at
	 * https://github.com/tify-iiif-viewer/tify/tree/main/dist/translations
	 * or add your own.
	 *
	 * @type {string}
	 */
	language: 'en',

	/**
	 * The URL of the IIIF manifest to load.
	 *
	 * @type {?string}
	 */
	manifestUrl: null,

	/**
	 * Viewer options that are reset on page change. Allowed array values are
	 * `'filters'`, `'pan'`, `'rotation'` and `'zoom'`.
	 *
	 * @type {Array.<string>}
	 */
	optionsResetOnPageChange: [
		'pan',
	],

	/**
	 * Defines how page labels are displayed in the page selector and in the
	 * thumbnails view. The placeholder `P` is replaced by the physical page
	 * number (consecutive numbers starting at `1`) while `L` is replaced by the
	 * logical page label, which can be any string, defined by the manifest.
	 *
	 * @type {string}
	 */
	pageLabelFormat: 'P : L',

	/**
	 * The page(s) to display initially. If `null`, the initial page is
	 * determined by the manifest’s `startCanvas`, and if that is not set either,
	 * the first page is displayed. Page numbers start at 1.
	 *
	 * @type {?Array.<number>}
	 */
	pages: null,

	/**
	 * Sets the initial pan. The object has two optional properties `x` and `y`,
	 * both floating-point numbers. The higher the value, the more to the left
	 * respectively top the image is positioned. By default, the image is
	 * centered within the container.
	 *
	 * @type {object}
	 */
	pan: {},

	/**
	 * The initial rotation of the scan in degrees. Should be a multiple of 90.
	 *
	 * @type {?number}
	 */
	rotation: null,

	/**
	 * The URL of the directory where TIFY finds its translations, without a
	 * trailing `/`. If not set, TIFY tries to determine this URL automatically
	 * from its `<script>` element, but this may not work depending on how TIFY
	 * is loaded.
	 *
	 * @type {?string}
	 */
	translationsDirUrl: null,

	/**
	 * If set, parameters are read from the URL query and any changes are
	 * reflected, using the key provided. This works with multiple concurrent
	 * instances, but each instance must use a unique key. Note that when
	 * `urlQueryKey` is set, all options defined by `urlQueryParams` can be
	 * overridden by changing the URL in the browser’s address bar.
	 * Only use characters `A…Z a…z 0…9 - _`.
	 *
	 * @type {?string}
	 */
	urlQueryKey: null,

	/**
	 * The parameter keys to be read from and stored in the URL query. Only has
	 * effect if `urlQueryKey` is set, in which case parameters read from the URL
	 * override options of the same name.
	 *
	 * @type {Array.<string>}
	 */
	urlQueryParams: [
		'annotationId',
		'annotationsVisible',
		'childManifestUrl',
		'filters',
		'pages',
		'pan',
		'rotation',
		'view',
		'zoom',
	],

	/**
	 * The initially displayed view (panel); `fulltext`, `thumbnails`,
	 * `toc`, `info`, `help`, or `null` to display (only) the scan.
	 * On large screens, the scan is always shown next to the selected view.
	 *
	 * @type {?string}
	 */
	view: null,

	/**
	 * An object with options for OpenSeadragon, TIFY’s image rendering
	 * component. See its documentation at
	 * https://openseadragon.github.io/docs/OpenSeadragon.html#.Options
	 * for all available options.
	 *
	 * @type {object}
	 */
	viewer: {},

	/**
	 * Sets the initial zoom level. The higher the number, the deeper the zoom.
	 * By default, zoom is set automatically so that the full image is visible.
	 *
	 * @type {?number}
	 */
	zoom: null,
};
