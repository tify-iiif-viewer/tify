<h1>
	<a href="https://github.com/tify-iiif-viewer/tify">
		<img src="https://tify.rocks/img/tify-logo.svg" alt="TIFY" width="148" height="60">
	</a>
</h1>

TIFY is a slim and mobile-friendly [IIIF](https://iiif.io/) document viewer built with [Vue.js](https://vuejs.org/). It supports [IIIF Presentation API and Image API](https://iiif.io/api/) version 2 and 3.

**[Check out the demo.](https://tify-iiif-viewer.github.io/tify/)**

Continue reading to learn how to integrate TIFY into your website or application and about its options and API, [visit the website for usage examples](https://tify.rocks/), or [have a look at the documentation](doc).

## Embedding TIFY

TIFY is available as an [npm package](https://www.npmjs.com/package/tify):

``` bash
npm install tify
```

Embed TIFY into your website in three easy steps:

1. Include both the JavaScript and the stylesheet.

	- Either download TIFY and copy the contents of the `dist` directory to your server:

		``` html
		<script src="tify.js?v0.34.2"></script>
		<link rel="stylesheet" href="tify.css?v0.34.2">
		```

		> To avoid issues with browser caching, add a query parameter with the current version, e.g. `?v0.34.2`.

	- Or use [jsDelivr](https://www.jsdelivr.com/):

		``` html
		<script src="https://cdn.jsdelivr.net/npm/tify@0.34.2/dist/tify.js"></script>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tify@0.34.2/dist/tify.css">
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

## Configuration

TIFY takes an options object as its only parameter. While optional, you usually want to set `container` and `manifestUrl`.

See [config.js](src/config.js) for a documentation of all available options.

An example with most options set to non-default values:

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

TIFY provides an API for controlling most of its features, see [API documentation](doc/api.md).

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

## Translations

Translations reside in `public/translations`. Each language is represented by a JSON file, where the file name is the language’s [ISO 639 alpha-2 code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes). Each file consists of a single object of key-value pairs; the key is the original English string, the value is the translation.

The key `$language` denotes the native name of the translation’s language.

There are more special keys starting with `$`; while all other keys are to be translated literally, these keys serve as placeholders for longer sections of text, see `src/strings.json`.

English keys (but not translated values) may contains translation hints in square brackets, e.g. `View [noun]` should be treated as a noun, not as a verb.

To create a new empty translation, run `node build/create-translation.js` and follow the prompts.

To check all translations for validity and completeness, use `npm run test:i18n` or `npm run test:i18n:fix`, the latter adding missing keys, removing unused keys, and sorting keys.

---

<a href="https://www.sub.uni-goettingen.de/en/">
	<img src="https://tify.rocks/img/sub-logo.svg" width="329" height="30" alt="Göttingen State and University Library">
</a>
