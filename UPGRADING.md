# Upgrading TIFY

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
