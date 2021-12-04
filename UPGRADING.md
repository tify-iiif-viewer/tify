# Upgrading TIFY

## Upgrading to v0.25.0 from any prior release

- The stylesheet is no longer loaded automatically. Add `<link rel="stylesheet" href="tify.css?v0.25.0">` to the `<head>` of your HTML.
- TIFY is now a class and must be instantiated, taking an options object as the only parameter instead of setting options globally via `tifyOptions`. To get the exact previous behavior, set `container`, `manifestUrl` (if not set via URL query), `urlQueryKey`, and the initial `view`:
	``` js
	new Tify({
		container: '#tify',
		manifestUrl: 'https://example.org/iiif-manifest.json',
		urlQueryKey: 'tify',
		view: 'info',
	})
	```
- Renamed or changed options:
	- `immediateRender` has been replaced with `viewer.immediateRender`.
	- `manifest` has been renamed to `manifestUrl`.
	- `title` has been replaced with `titleAffix`, which now includes the separator characters (default ` | `).
	- `view` is now an empty string by default instead of `info`, meaning TIFY only displays the scan.
- Removed options (ignored if set):
	- `init`
	- `stylesheet`
