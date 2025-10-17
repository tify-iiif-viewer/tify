# Upgrading TIFY

## v0.34

- If you load `tify.js` directly, wether self-hosted or from a CDN, you need to use `<script type="module">`. [See readme for details.](README.md)
- TIFY now inherits the host website’s font size and line height; most dimensions are derived from the font size. Add the following CSS to restore the previous dimensions:

	``` css
	.tify {
		--tify-font-size: 16px;
		--tify-line-height: 24px;
	}
	```

- In the `view` option, `'fulltext'` has been renamed to `'text'`. URL queries with the old value are still supported.
- If you customized the theme, note that many styles and some classes have changed. `.tify-scan` and all child classes have been renamed to `.tify-media`, and `.tify-fulltext` has been renamed to `.tify-text`.
- The `breakpoints` option has been removed.

## v0.33

No breaking changes.

## v0.32

- `'scan'` is no longer a valid value for `view`. Use the default value `null` instead, or omit the `view` option.
- The default page label format has been changed to `P · L`, resulting in for example `1 · Cover`. For pages without a label, only the number is displayed, regardless of the format.

## v0.31

No breaking changes.

## v0.30

TIFY now supports IIIF Presentation API and Image API version 2 and 3. There are no breaking changes.

## v0.29

- Only concerns local development: Node script names have been changed to match current Vue defaults, e.g. `npm run serve` is now `npm run dev`. See README.md and package.json for more details.

## v0.28

- Layout breakpoints have changed, so TIFY may show different interface elements than before, depending on its container size. Modify the `breakpoints` option if required.
- If you are using a customized stylesheet, it probably needs updating.

## v0.27

- The initially displayed page is now determined by the manifest’s `startCanvas`. To keep the previous behavior of starting with the first page regardless of `startCanvas`, add `pages: [1]` to TIFY’s options.

## v0.26

- Support for setting the manifest URL via query parameter `manifest` has been removed. If you need this feature, use something like this:

	``` js
	new Tify({
		container: '#tify',
		manifestUrl: (new URLSearchParams(window.location.search)).get('manifest'),
	})
	```

## v0.25

- The stylesheet is no longer loaded automatically. Add `<link rel="stylesheet" href="tify.css?v0.25.3">` to the `<head>` of your HTML.
- TIFY is now a class and must be instantiated, taking an options object as the only parameter instead of setting options globally via `tifyOptions`. To get the previous behavior, set `container`, `manifestUrl` (if not set via URL query), `urlQueryKey`, and the initial `view`:

	``` js
	new Tify({
		container: '#tify',
		manifestUrl: 'https://example.org/iiif-manifest.json',
		urlQueryKey: 'tify',
		view: 'info',
	})
	```
- Changed options:
	- `immediateRender` has been replaced with `viewer.immediateRender`.
	- `init` has been removed.
	- `manifest` has been renamed to `manifestUrl`.
	- `panX` and `panY` have been merged into `pan`, an object with two properties `x` and `y`. Old URLs with `panX` and `panY` are still supported.
	- `stylesheet` has been removed.
	- `title` has been removed.
	- `view` is now an empty string by default instead of `info`, meaning TIFY only displays the scan.
- Only relevant if you are using custom styles or added event handlers: In all HTML and CSS class names, `_` has been replaced with `-`. The wrapper class has been changed from `tify-app` to `tify`.
- Internet Explorer 11 is no longer supported.
