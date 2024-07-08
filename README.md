<h1>
	<a href="https://github.com/tify-iiif-viewer/tify">
		<img src="https://tify.rocks/img/tify-logo.svg" alt="TIFY" width="148" height="60">
	</a>
</h1>

TIFY is a slim and mobile-friendly [IIIF](https://iiif.io/) document viewer built with [Vue.js](https://vuejs.org/). It supports [IIIF Presentation API and Image API](https://iiif.io/api/) version 2 and 3.

Continue reading to learn how to integrate TIFY into your website or application and about its options and API, [check out the website for usage examples](https://tify.rocks/), or [have a look at the user guide](doc/user-guide.en.md).

## Embedding TIFY

TIFY is available as an [npm package](https://www.npmjs.com/package/tify):

``` bash
npm install tify
```

Embed TIFY into your website in three easy steps:

1. Include both the JavaScript and the stylesheet.

	- Either download TIFY and copy the contents of the `dist` directory to your server:

		``` html
		<script src="tify.js?v0.31.0"></script>
		<link rel="stylesheet" href="tify.css?v0.31.0">
		```

		> To avoid issues with browser caching, add a query parameter with the current version, e.g. `?v0.31.0`.

	- Or use [jsDelivr](https://www.jsdelivr.com/):

		``` html
		<script src="https://cdn.jsdelivr.net/npm/tify@0.31.0/dist/tify.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tify@0.31.0/dist/tify.css">
		```

	- Or `import` TIFY into your web application:

		``` js
		import 'tify'
		import 'tify/dist/tify.css'
		```

2. Add an HTML block element with an `id` and set its `height`.

	``` html
	<div id="tify" style="height: 640px"></div>
	```

3. Create a TIFY instance.

	``` html
	<script>
	new Tify({
	  container: '#tify',
	  manifestUrl: 'https://example.org/iiif-manifest.json',
	})
	</script>
	```

Many aspects of the theme can be modified with SCSS variables or CSS custom properties, allowing you to easily adapt TIFY’s appearance to your website. [See the theme settings file](src/styles/util/settings.scss) for all available variables.

## Upgrading

If you are are upgrading from any previous version, [have a look at the upgrading guidelines](UPGRADING.md).

## Options

TIFY takes an options object as its only parameter. While optional, you usually want to set `container` and `manifestUrl`.

- **`childManifestAutoloaded`**: boolean, default `true`

	If the manifest set by `manifestUrl` is a collection (`@type` is `sc:Collection`) and `childManifestUrl` is not set, automatically load the first manifest in the collection. This only works for collections with `manifests` on the first level; when the collection only contains other collections and `childManifestUrl` is not set, only the collection view is shown until the user selects a child manifest to load.

- **`childManifestUrl`**: string or `null` (default)

	If the manifest set by `manifestUrl` is a collection (`@type` is `sc:Collection`), additionally load another IIIF manifest, whose `@type` must be `sc:Manifest`. Note that TIFY does not check if this additional manifest is actually part of the collection.

- **`container`**: string or HTMLElement or `null` (default)

	The HTML element into which TIFY is mounted. If set to `null`, TIFY is not mounted at all until `mount` is called (see [API](#api)).

- **`fallbackLanguage`**: string, default `'en'`

	The language to be used for strings from the IIIF manifest that are not available in the current `language`. If no value matches `language` or `fallbackLanguage`, the first available language is displayed.

- **`filters`**: object, default `{}`

	Sets the initial image filters. Available properties are `'brightness'`, `'contrast'` (both a floating-point number between `0.5` and `2`) and `'saturation'` (floating-point number between `0` and `3`), all optional.

- **`language`**: string, default `'en'`

	The interface language, matching the translation filename without extension. [See which translations are available](https://github.com/tify-iiif-viewer/tify/tree/main/dist/translations) or add your own.

- **`manifestUrl`**: string or `null` (default)

	The URL of the IIIF manifest to load.

- **`optionsResetOnPageChange`**: array of strings, default `['pan']`

	Viewer options that are reset on page change. Allowed array values are `'filters'`, `'pan'`, `'rotation'` and `'zoom'`.

- **`pageLabelFormat`**: string, default `'P : L'`

	Defines how page labels are displayed in the page selector and in the thumbnails view. The placeholder `P` is replaced by the physical page number (consecutive numbers starting at `1`) while `L` is replaced by the logical page label, which can be any string, defined by the manifest.

- **`pages`**: array of 1-based integers or `null` (default)

	The page(s) to display initially. If `null`, the initial page is determined by the manifest’s `startCanvas`, and if that is not set either, the first page is displayed. Page numbers start at 1.

- **`pan`**: object, default `{}`

	Sets the initial pan. The object has two optional properties `x` and `y`, both floating-point numbers. The higher the value, the more to the left respectively top the image is positioned. By default, the image is centered within the container.

- **`translationsDirUrl`**: string or `null` (default)

	The URL of the directory where TIFY finds its translations, without trailing `/`. If not set, TIFY tries to determine this URL automatically from its `<script>` element, but this may not work depending on how TIFY is loaded.

- **`urlQueryKey`**: string or `null` (default), only use characters `A…Z a…z 0…9 - _`

	If set, parameters are read from the URL query and any changes are reflected, using the key provided. This works with multiple concurrent instances, but each instance must use a unique key. Note that when `urlQueryKey` is set, all options defined by `urlQueryParams` can be overridden by changing the URL in the browser’s address bar.

- **`urlQueryParams`**: array of strings, default `['childManifestUrl', 'filters', 'pages', 'pan', 'rotation', 'view', 'zoom']`

	The parameter keys to be read from and stored in the URL query. Only has effect if `urlQueryKey` is set, in which case parameters read from the URL override options of the same name.

- **`view`**: string, default `''`

	The initially displayed view (panel); `scan`, `fulltext`, `thumbnails`, `toc`, `info`, `help`, or empty (same as `scan`). On large screens, the scan is always shown next to the selected view.

- **`viewer`**: object

	An object with options for OpenSeadragon, TIFY’s image rendering component. [See its documentation](https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for all available options.

- **`zoom`**: floating-point number, default `null`

	Sets the initial zoom level. The higher the number, the deeper the zoom. By default, zoom is set automatically so that the full image is visible.

An example with most available options set to non-default values:

``` js
new Tify({
  container: '#tify',
  language: 'de',
  manifestUrl: 'https://example.org/iiif-manifest.json',
  pageLabelFormat: 'P (L)',
  pages: [2, 3],
  pan: { x: .45, y: .6 },
  translationsDirUrl: '/translations/tify',
  urlQueryKey: 'tify',
  urlQueryParams: ['pages'],
  view: '',
  viewer: {
    immediateRender: false,
  },
  zoom: 1.2,
})
```

## API

With the exception of `mount` and `destroy`, all API functions are only available after TIFY has been mounted and the manifest has been loaded. Then the `ready` promise is fulfilled. There is no API function to load a new manifest; just replace the instance.

Use the API like this:

``` js
const tify = new Tify({ manifestUrl: 'https://example.org/iiif-manifest.json' })

tify.mount('#tify')

tify.ready.then(() => {
  tify.setPage([1, 12, 13])
  tify.setView('thumbnails')
  tify.viewer.viewport.zoomTo(2)
})
```

- **`destroy`**

	Destroys the current instance and removes event listeners. If you are using TIFY in an SPA, this should be called every time a page containing TIFY is unmounted to avoid memory leaks.

	No parameters.

- **`mount`**

	Mounts TIFY.

	Parameters:

	- `container`: string or HTMLElement, required

		CSS selector pointing to a single HTML node or the node itself into which TIFY is mounted.

- **`resetScan`**

	Resets the scan display options.

	Parameters:

	- `includingFiltersAndRotation`: boolean, default `false`

		By default, only pan and zoom are reset. If `true`, image filters and rotation are reset, too.

- **`setPage`**

	Changes the active page or pages.

	Parameters:

	- `pageOrPages`: 1-based integer or array thereof (required)

		Provide a number to display a single page or an array of numbers to display multiple pages at once. If the number (or any of the numbers in the array) is smaller than `1` or greater than the number of pages in the document, the command is ignored.

	Returns an array of the current pages or `false` if `pageOrPages` is invalid.

- **`setLanguage`**

	Changes the frontend language and loads the associated translation. This function returns a Promise.

	Parameters:

	- `language`: string, default `'en'`

		The language to load. A JSON file containing the translations for this language must be present in `public/translations`. Untranslated strings are displayed in English.

- **`setView`**

	Changes the active view (panel).

	Parameters:

	- `name`: string (required)

		The view’s name; `'export'`, `'fulltext'`, `'help'`, `'info'`, `'scan'`, `'thumbnails'`, `'toc'`, or an empty string (same as `'scan'`).

- **`toggleDoublePage`**

	Switches from single to double page (“book view”) and vice versa.

	Parameters:

	- `forced`: boolean, default `false`

		Double page is forced on (`true`) or off (`false`).

- **`toggleFullscreen`**

	Toggles fullscreen mode. For security reasons, most browsers require a user interaction to enter fullscreen mode; a button calling this function via `onclick` works, but trying to do so automatically does probably not.

	Parameters:

	- `forced`: boolean, default `false`

		Fullscreen is forced on (`true`) or off (`false`).

### OpenSeadragon API

The `viewer` object exposes the full [OpenSeadragon API](https://openseadragon.github.io/docs/OpenSeadragon.html). If you want to control the scan view programmatically, the [methods of `viewer.viewport`](https://openseadragon.github.io/docs/OpenSeadragon.Viewport.html) are probably of interest.

## Build Setup

You need to have Node.js v18.0 or above, npm (usually comes with Node.js) and git installed.

Install dependencies:

``` bash
npm install
```

Run in development mode with hot reload and automatic linting:

``` bash
npm run dev
```

Build for production with minification:

``` bash
npm run build
```

The production build will be stored in `dist`.

### Running Tests

Run unit tests: `npm run test:unit`

Run end-to-end tests:
- Development build: `npm run dev`
- Production build: `npm run build && npm run test:e2e`

---

<a href="https://www.sub.uni-goettingen.de/en/">
	<img src="https://tify.rocks/img/sub-logo.svg" width="329" height="30" alt="Göttingen State and University Library">
</a>
