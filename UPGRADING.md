# Upgrading TIFY

## Upgrading to v0.25.0 from any prior release

- `dist` filenames now include the current version of TIFY. Change `<script src="tify.js"></script>` to  `<script src="tify-0.25.0.js"></script>`.
- The stylesheet is no longer loaded automatically. Add `<link rel="stylesheet" href="tify-0.25.0.css">` to the `<head>` of your HTML.
- TIFY is now a class and must be instantiated, taking an options object as the only parameter instead of setting options globally via `tifyOptions`. All options are optional, but to get the previous behavior, add at least a `container` and `manifestUrl` (if the latter is not set via URL query):
	``` js
	new Tify({
		container: '#tify',
		manifestUrl: 'https://example.org/iiif-manifest.json'
	})
	```
- `main.js` now exports a wrapper object instead of the Vue instance itself, so instead of `import tify from 'tify'` you would use:
	``` js
	import Tify from 'tify'
	⋮
	const tify = new Tify()
	```
- Renamed or changed options:
	- `immediateRender` has been replaced with `viewer.immediateRender`.
	- `manifest` has been renamed to `manifestUrl`.
	- `title` has been replaced with `titleAffix`, which now includes the separator characters (default ` | `).
	- `view` is now by default an empty string instead of `info`, meaning TIFY only displays the scan.
- Removed options (ignored if set):
	- `init`
	- `stylesheet`

To achieve the same results as in versions lower than 0.25 at least the parameter `urlQueryKey: 'tify'` has to be set to keep the URL handling.
