# TIFY API

TIFY provides an API for controlling most of its features. With the exception of `mount` and `destroy`, all API functions are only available after TIFY has been mounted and the manifest has been loaded. Then the `ready` promise is fulfilled. There is no API function to load a new manifest; just replace the instance.

Use the API like this:

``` js
const tify = new Tify({ manifestUrl: 'https://example.org/iiif-manifest.json' })

tify.mount('#tify')

tify.ready.then(() => {
  tify.setPage([1, 12, 13])
  tify.setView('thumbnails')
  tify.viewer.viewport.zoomTo(2)
})
```

## Functions

- **`destroy`**

	Destroys the current instance and removes event listeners. If you are using TIFY in an SPA, this should be called every time a page containing TIFY is unmounted to avoid memory leaks.

	No parameters.

- **`mount`**

	Mounts TIFY.

	Parameters:

	- `container`: string or HTMLElement, required

		CSS selector pointing to a single HTML node or the node itself into which TIFY is mounted.

- **`resetScan`**

	Resets the scan display options.

	Parameters:

	- `includingFiltersAndRotation`: boolean, default `false`

		By default, only pan and zoom are reset. If `true`, image filters and rotation are reset, too.

- **`setPage`**

	Changes the active page or pages.

	Parameters:

	- `pageOrPages`: 1-based integer or array thereof (required)

		Provide a number to display a single page or an array of numbers to display multiple pages at once. If the number (or any of the numbers in the array) is smaller than `1` or greater than the number of pages in the document, the command is ignored.

	Returns an array of the current pages or `false` if `pageOrPages` is invalid.

- **`setLanguage`**

	Changes the frontend language and loads the associated translation. This function returns a Promise.

	Parameters:

	- `language`: string, default `'en'`

		The language to load. A JSON file containing the translations for this language must be present in `public/translations`. Untranslated strings are displayed in English.

- **`setView`**

	Changes the active view (panel).

	Parameters:

	- `name`: string (required)

		The view’s name; `'export'`, `'fulltext'`, `'help'`, `'info'`, `'thumbnails'`, `'toc'`, or `null` to display (only) the scan.

- **`toggleDoublePage`**

	Switches from single to double page (“book view”) and vice versa.

	Parameters:

	- `forced`: boolean, default `false`

		Double page is forced on (`true`) or off (`false`).

- **`toggleFullscreen`**

	Toggles fullscreen mode. For security reasons, most browsers require a user interaction to enter fullscreen mode; a button calling this function via `onclick` works, but trying to do so automatically does probably not.

	Parameters:

	- `forced`: boolean, default `false`

		Fullscreen is forced on (`true`) or off (`false`).

## OpenSeadragon API

The `viewer` object exposes the full [OpenSeadragon API](https://openseadragon.github.io/docs/OpenSeadragon.html). If you want to control the scan view programmatically, the [methods of `viewer.viewport`](https://openseadragon.github.io/docs/OpenSeadragon.Viewport.html) are probably of interest.
