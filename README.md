# TIFY

The fastest IIIF document viewer. [Check out the demo.](https://subugoe.github.io/tify/demo.html?manifestUrl=https://purl.stanford.edu/qm670kv1873/iiif/manifest.json)

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

The only required parameter `manifestUrl` is a URL pointing to the manifest. It can be set either as a query parameter or with the `tifyOptions` object, whereby the latter takes precedence. Below an example with all available options, which must be set prior to loading TIFY.

``` html
<div id="viewer"></div>
<script>
	tifyOptions = {
		container: '#viewer', // default: '#tify'
		language: 'de', // default: 'en' (translations are incomplete)
		manifestUrl: 'https://example.com/iiif/manifest.json', // default: none
		stylesheetUrl: 'styles/my-very-own-tify-styles.css', // default: none, using default styles
		title: 'TIFY Demo', // default: 'TIFY'
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

In development mode, the manifest URL must be provided via query parameter, e.g. `http://localhost:8080/?manifestUrl=http://gdzdev.sub.uni-goettingen.de/api/PPN616082037/manifest`.

# Build for production with minification

``` bash
npm run build
```

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
