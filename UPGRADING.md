# Upgrading TIFY

## Any prior release to v0.29

- Only concerns local development: Node script names have been changed to match current Vue defaults, e.g. `npm run serve` is now `npm run dev`. See README.md and package.json for more details.

## Any prior release to v0.28

- Layout breakpoints have changed, so TIFY may show different interface elements than before, depending on its container size. Modify the `breakpoints` option if required.
- If you are using a customized stylesheet, it probably needs updating.

## Any prior release to v0.27

- The initially displayed page is now determined by the manifest’s `startCanvas`. To keep the previous behavior of starting with the first page regardless of `startCanvas`, add `pages: [1]` to TIFY’s options.

## Any prior release to v0.26

- Support for setting the manifest URL via query parameter `manifest` has been removed. If you need this feature, use something like this:
	``` js
	new Tify({
		container: '#tify',
		manifestUrl: (new URLSearchParams(window.location.search)).get('manifest'),
	})
	```

## Any prior release to v0.25

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
