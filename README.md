<p>
	<a href="https://github.com/tify-iiif-viewer/tify">
		<img src="https://demo.tify.rocks/public/img/tify-logo.svg" alt="TIFY" width="148" height="60">
	</a>
</p>

TIFY is a slim and mobile-friendly IIIF document viewer built with [Vue.js](https://vuejs.org/).

[Check out the website for usage examples.](https://tify.rocks/)

## Embedding TIFY

TIFY is available as an [npm package](https://www.npmjs.com/package/tify):

``` bash
npm install tify
```

To embed TIFY into your website:

1. Copy the contents of the `dist` directory to your server.
2. Include the TIFY JavaScript and CSS files.
3. Add an HTML element and set its `width` and `height`.
4. Create a TIFY instance.

The required HTML looks something like this:

``` xml
<script src="tify.js?v0.25.0"></script>
<link rel="stylesheet" href="tify.css?v0.25.0">
⋮
<div id="tify" style="width: 100%; height: 640px"></div>
<script>
  new Tify({
    container: '#tify',
    manifestUrl: 'https://example.org/iiif-manifest.json',
  })
</script>
```

> If you are loading TIFY’s JavaScript via `<script>` and the stylesheet via `<link>`, like in the example above, add a query parameter with the current version, e.g. `?v0.25.0`, to avoid issues with browser caching.

When creating a web application, you can also use `import 'tify'`.

## Upgrading

If you are are upgrading from any previous version, please have a look at the [upgrading guidelines](UPGRADING.md).

## Options

TIFY takes an options object as its only parameter. While optional, you usually want to set the `container` and the `manifestUrl`.

- `container` (string or HTMLElement or null, default `null`): The HTML element into which TIFY is mounted. If set to `null`, TIFY is not mounted at all until `mount` is called (see [_API_](#api) below).
- `language` (string, default `en`): The interface language, matching the translation filename without extension. [See which translations are available](https://github.com/tify-iiif-viewer/tify/tree/main/dist/translations) or add your own.
- `manifestUrl` (string): The URL of the IIIF manifest. If not set, the URL has to be provided via query parameter `manifest`, e.g. `https://example.org/?manifest=https://example.org/iiif-manifest.json`.
- `viewer` (object): An object with options for OpenSeadragon, TIFY’s image rendering component. [See its documentation](https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for all available options.
- `pageLabelFormat` (string, default `P : L`): Defines how page labels are displayed in the page selector and in the thumbnails view. The placeholder `P` is replaced by the physical page number (consecutive numbers starting at `1`) while `L` is replaced by the logical page label, which can be any string, defined by the manifest.
- `pages` (array of 1-based integers, default `[1]`): The page(s) to display initially. Page numbers are physical numbers, starting at 1. This setting can be overridden by setting `pages` via URL query if `urlQueryKey` is set.
- `titleAffix` (string): If set, TIFY replaces the window title with the document title from the manifest, appended by this string, e.g. ` | TIFY`.
- `translationsDirUrl` (string): The URL of the directory where TIFY finds its translations (without trailing `/`). TIFY tries to determine this URL automatically from its `<script>` element, but if TIFY was loaded in another way, or if you want to load you own translation, this option must be set.
- `urlQueryKey` (string, only use characters `A…Z a…z 0…9 - _ . ~`): Read parameters from the URL query and reflect any changes, using the key provided. This also works with multiple concurrent instances, but each instance must use a unique key.
- `urlQueryParams` (array of strings, default `['filters', 'pages', 'panX', 'panY', 'rotation', 'view', 'zoom']`): An array of parameter keys to be stored in the URL query on change. Only has effect if `urlQueryKey` is set.
- `view` (string, default empty): The initially displayed view (panel); `scan` (only has effect on mobile), `fulltext`, `thumbnails`, `toc`, `info`, or `help`.

An example with most available options set to non-default values:

``` js
new Tify({
  container: '#tify',
  language: 'de',
  manifestUrl: 'https://example.org/iiif-manifest.json',
  pageLabelFormat: 'P (L)',
  pages: [2, 3],
  titleAffix: ' | TIFY',
  translationsDirUrl: '/translations/tify',
  urlQueryKey: 'tify',
  urlQueryParams: ['pages'],
  view: '',
  viewer: {
    immediateRender: false,
  },
})
```

## API

With the exception of `mount` and `destroy`, all API functions are only available after TIFY has been mounted and the manifest has been loaded. Then the promise `ready` is fulfilled.

The API can be used like this:

``` js
const tify = new Tify({ manifestUrl: 'https://example.org/iiif-manifest.json' })

tify.mount('#tify')

tify.ready.then(() => {
	tify.setPage([1, 12, 13])
	tify.setView('thumbnails')
	tify.viewer.viewport.zoomTo(2)
})
```

There is no API function to load a new manifest; just replace the instance.

- ### `destroy`

	Destroys the current instance and removes event listeners. If you are using TIFY in an SPA, this should be called every time a page containing TIFY is unmounted to avoid memory leaks.

	<small>No parameters.</small>

- ### `mount`

	Mounts TIFY.

	#### Parameters

	- `container` (string or HTMLElement): CSS selector pointing to a single HTML node or the node itself into which TIFY is mounted.

- ### `resetViewer`

	Resets the viewer display options.

	#### Parameters

	- `includingFiltersAndRotation` (boolean): By default, only pan and zoom are reset. Set to `true` to also reset image filters and rotation.

- ### `setPage`

	Changes the active page or pages.

	#### Parameters

	- `pageOrPages` (1-based integer or array thereof): Provide a number to display a single page or an array of numbers to display multiple pages at once. If the number (or any of the numbers in the array) is smaller than `1` or greater than the number of pages in the document, the command is ignored.

	Returns an array of the current pages or `false` if `pageOrPages` is invalid.

- ### `setLanguage`

	Changes the frontend language and loads the associated translation.

	#### Parameters

	- `language` (string, default `en`): The language code to load.  A JSON file containing the translations for this language must be present in `public/translations`. Strings with missing translation are displayed in English.

- ### `setView`

	Changes the active view (panel).

	#### Parameters

	- `name` (string): The view’s name; `export`, `fulltext`, `help`, `info`, `scan`, `thumbnails`, `toc`, or an empty string (same as `scan`).

- ### `toggleDoublePage`

	Switches from single to double page (“book view”) and vice versa.

	#### Parameters

	- `force` (boolean, default `false`): Double page is forced on (`true`) or off (`false`).

- ### `toggleFullscreen`

	Toggles fullscreen mode. For security reasons, most browsers require a user interaction to enter fullscreen mode; a button calling this function via `onclick` works, but trying to do so automatically does probably not.

	#### Parameters

	- `force` (boolean, default `false`): Fullscreen is forced on (`true`) or off (`false`).


### OpenSeadragon API

The object `viewer` exposes the full [OpenSeadragon API](https://openseadragon.github.io/docs/OpenSeadragon.html). If you want to control the scan view programmatically, the [methods of `viewer.viewport`](https://openseadragon.github.io/docs/OpenSeadragon.Viewport.html) are probably of interest.

## Build Setup

You need to have Node.js v12.0 or above, npm v5.5.1 or above (usually comes with Node.js) and git installed.

Install dependencies:

``` bash
npm install
```

Run in development mode with hot reload on `localhost:8080`:

``` bash
npm run serve
```

The manifest URL can be provided via option or query parameter (see above).

Build for production with minification:

``` bash
npm run build
```

The production build will be stored in `dist`.

## Running Tests

``` bash
# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

---

<a href="https://www.sub.uni-goettingen.de/en/">
	<img src="https://demo.tify.rocks/supporters/sub-logo.svg" width="329" height="30" alt="Göttingen State and University Library (SUB Göttingen)"/>
</a>
