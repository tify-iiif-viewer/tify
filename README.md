<p>
	<a href="https://github.com/subugoe/tify">
		<img src="https://subugoe.github.io/tify/static/tify-logo.svg" alt="TIFY" width="148" height="60">
	</a>
</p>

TIFY is a slim and mobile-friendly IIIF document viewer built with [Vue.js](https://github.com/vuejs/vue).

[Check out the demo](http://tify.sub.uni-goettingen.de/demo.html?manifest=https://gdzstaging.sub.uni-goettingen.de/iiif/presentation/PPN857449303/manifest) and feel free to load your own manifests by changing the URL.

## Embedding TIFY

TIFY is available as an [npm package](https://www.npmjs.com/package/tify):

``` bash
npm install tify
```

To embed TIFY into your site:
1. Copy the contents of the `dist/` directory to your server.
2. Add an HTML element serving as the container.
3. Include `tify.js`.

The container element should have the following CSS applied:
- either `position: relative` or `position: absolute`
- `height` and `width`

The required HTML code looks something like this:

``` html
<div id="tify"></div>
<script src="tify.js"></script>
```

The only required parameter `manifest` is a URL pointing to the manifest. It can be set either as a query parameter or with the `tifyOptions` object, whereby the latter takes precedence.

### Options
- `container` (string or HTMLElement, default: `#tify`): The HTML element TIFY is loaded into.
- `immediateRender` (boolean, default: `true`): Set this to `false` to render lower resolution tiles until the full resolution is loaded, providing the effect of blurry to sharp. Note that this increases loading times.
- `language` (string, default: `en`): The interface language. Currently, only English and German (`de`) are available.
- `manifest` (string): A URL pointing to the IIIF manifest. If this option is not set, the URL has to be provided via a query parameter of the same name.
- `stylesheet` (string): Use this to provide your own stylesheet, replacing TIFY's default styles. Set to `null` to prevent TIFY from loading any styles, e.g. if your site's stylesheet already includes styles for TIFY.
- `title` (string, default: `TIFY`): By default, TIFY replaces the window title with the document title as defined by the manifest, appended by `TIFY`. Set this to any string, or `null` to disable title modification.

### Example

Below an example with all available options set.

``` html
<div id="viewer"></div>
<script>
	tifyOptions = {
		container: '#viewer',
		immediateRender: false,
		language: 'de',
		manifest: 'https://example.com/iiif/manifest.json',
		stylesheet: '../styles/my-very-own-tify-styles.css',
		title: null,
	}
</script>
<script src="tify.js"></script>
```

## Build Setup

Install dependencies:

``` bash
npm install
```

Run in development mode with hot reload on `localhost:8080`:

``` bash
npm run dev
```

In development mode, the manifest URL must be provided via query parameter, e.g. `http://localhost:8080/?manifest=https://gdzstaging.sub.uni-goettingen.de/iiif/presentation/PPN857449303/manifest`.

Build for production with minification:

``` bash
npm run build
```

The production build will be stored in `dist`, just copy the contents of this directory to your server.

## Running Tests

``` bash
# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
