export default {
	data() {
		return {
			urlUpdateTimeout: null,
		};
	},
	mounted() {
		this.expose(this.setPage);
	},
	beforeDestroy() {
		clearTimeout(this.urlUpdateTimeout);
	},
	methods: {
		getStartPage() {
			const { startCanvas } = this.manifest.sequences[0];
			const startCanvasIndex = this.canvases.findIndex((canvas) => canvas['@id'] === startCanvas);
			return startCanvasIndex >= 0 ? startCanvasIndex + 1 : 1;
		},
		isValidPagesArray(pages) {
			if (!Array.isArray(pages)) {
				return false;
			}

			// Checking for duplicates
			if ((new Set(pages)).size !== pages.length) {
				return false;
			}

			for (let i = 0, len = pages.length; i < len; i += 1) {
				if (!Number.isInteger(pages[i])
					|| (i > 0 && pages[i] > 0 && pages[i] <= pages[i - 1])
					|| pages[i] < 0
					|| pages[i] > this.pageCount
				) return false;
			}

			return true;
		},
		setPage(pageOrPages) {
			let pages = pageOrPages;
			if (!Array.isArray(pageOrPages)) {
				pages = [pageOrPages];
			}

			if (!this.isValidPagesArray(pages)) {
				throw new RangeError('Invalid pages');
			}

			if (pages.length === 1
				&& this.options.pages
				&& this.options.pages[0] % 2 < 1
				&& (this.options.pages[1] === this.options.pages[0] + 1 || this.options.pages[1] === 0)
			) {
				const p = pages[0] % 2 > 0 ? pages[0] - 1 : pages[0];
				pages = [p, p === this.pageCount ? 0 : p + 1];
			}

			this.updateOptions({ pages });
			return pages;
		},
		updateOptions(options) {
			Object.assign(this.options, options);

			if (!window.history) {
				return;
			}

			if (this.$root.options.urlQueryKey) {
				clearTimeout(this.urlUpdateTimeout);

				this.urlUpdateTimeout = setTimeout(() => {
					const storedOptions = {};
					this.options.urlQueryParams.forEach((key) => {
						const param = this.options[key];
						if (
							param === null
							|| (key === 'pages' && param.length < 2 && param[0] < 2)
							|| (typeof param === 'object' && !Object.keys(param).length)
						) {
							delete storedOptions[key];
						} else {
							storedOptions[key] = this.options[key];
						}
					});

					const url = new URL(window.location);
					url.searchParams.set(this.$root.options.urlQueryKey, JSON.stringify(storedOptions));

					if (options.pages) {
						this.error = '';
						window.history.pushState({}, '', url);
					} else {
						window.history.replaceState({}, '', url);
					}
				}, 100);
			}
		},
		updateOptionsFromUrlQuery() {
			let params = {};

			try {
				const query = new URLSearchParams(window.location.search);
				params = JSON.parse(query.get(this.$root.options.urlQueryKey)) || {};
			} catch {
				// Nothing to do here
			}

			// NOTE: params.view can be an empty string (showing only the scan on large screens)
			if (params.view === '' && this.$root.isMobile()) {
				params.view = 'scan';
			}

			if (params.pages && !this.isValidPagesArray(params.pages)) {
				this.$root.error = 'Invalid pages, reset to start page';
				params.pages =	null;
			}

			this.options.childManifestUrl = params.childManifestUrl || this.options.childManifestUrl;
			this.options.filters = params.filters || this.options.filters;
			this.options.pages = params.pages || this.options.pages || [this.getStartPage()];
			this.options.pan = params.panX || params.panY
				? { x: params.panX, y: params.panY }
				: params.pan || this.options.pan;
			this.options.rotation = parseInt(params.rotation, 10) || this.options.rotation;
			this.options.view = params.view || params.view === ''
				? params.view
				: this.options.view;
			this.options.zoom = parseFloat(params.zoom) || this.options.zoom;
		},
	},
};
