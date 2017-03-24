# TIFY

The fastest IIIF document viewer. [Check out the demo.](https://subugoe.github.io/tify/demo.html?manifest=https://purl.stanford.edu/qm670kv1873/iiif/manifest.json)

## Embedding TIFY

To embed TIFY into your site:
1. Copy the contents of the `dist/` directory to your server.
2. Add an HTML element serving as the container
3. Load `tify.js`.

The container element should have the following CSS applied:
- either `position: relative` or `position: absolute`
- `height` and `width`

The required HTML code looks something like this:

``` html
<div id="tify"></div>
<script src="tify.js"></script>
```

The only requried parameter `manifest` is a URL pointing to the manifest. It can be set either as a query parameter or with the `tifyOptions` object, whereby the latter takes precendence. Below an example with all available options, which must be set prior to loading TIFY.

``` html
<div id="viewer"></div>
<script>
	tifyOptions = {
		container: '#viewer', // default: '#tify'
		language: 'de', // default: 'en' (translations are incomplete)
		manifest: 'https://example.com/iiif/manifest.json', // default: none
		stylesheet: 'styles/my-very-own-tify-styles.css', // default: none, using default styles
		title: 'TIFY Demo', // default: 'TIFY'
	}
</script>
<script src="tify.js"></script>
```

> Note that if TIFY is not located in the WWW root, you must set `stylesheet: '<tify-directory>/tify.css'` even for the default styles.

## Build Setup

Install dependencies:

``` bash
npm install
```

Build and run:

``` bash
# Serve with hot reload at localhost:8080
npm run dev

# Build for production with minification
npm run build
```

The manifest URL has to be provided with the query parameter `manifestUrl`, e.g. `http://localhost:8080/?manifestUrl=http://gdzdev.sub.uni-goettingen.de/api/PPN616082037/manifest`.

The production build will be stored in `dist`, just copy the contents of this directory to your server.

## Running Tests

Install AVA for unit tests and CodeceptJS for end-to-end tests:

``` bash
npm install -g ava
npm install -g codeceptjs
```

Run tests:

``` bash
# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
