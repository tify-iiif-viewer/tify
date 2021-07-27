export default {
	methods: {
		getParams() {
			let params = {};
			try {
				params = JSON.parse(this.getQueryParam('tify')) || {};
			} catch (e) {
				// Nothing to do here
			}

			// NOTE: params.view can be an empty string (showing only the scan on large screens)
			if (this.$root.isMobile() && !params.view) {
				params.view = 'scan';
			} else if (typeof params.view === 'undefined') {
				params.view = 'info';
			}

			let pages;

			if (this.isValidPagesArray(params.pages)) {
				// eslint-disable-next-line prefer-destructuring
				pages = params.pages;
			} else {
				if (params.pages) {
					this.$root.error = 'Invalid pages, reset to first page';
				}

				pages = [1];
			}

			return {
				filters: params.filters || {},
				pages,
				panX: parseFloat(params.panX) || null,
				panY: parseFloat(params.panY) || null,
				rotation: parseInt(params.rotation, 10) || null,
				view: params.view,
				zoom: parseFloat(params.zoom) || null,
			};
		},
		setPage(page) {
			const { pages } = this.params;
			if (pages[0] % 2 < 1 && (pages[1] === pages[0] + 1 || pages[1] === 0)) {
				const newPage = (page % 2 > 0 ? page - 1 : page);
				this.updateParams({ pages: [newPage, newPage === this.pageCount ? 0 : newPage + 1] });
				return;
			}
			this.updateParams({ pages: [page] });
		},
		getQueryParam(name) {
			const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		},
		isValidPagesArray(pages) {
			if (!Array.isArray(pages)) {
				return false;
			}

			// Check for duplicates
			if ((new Set(pages)).size !== pages.length) {
				return false;
			}

			for (let i = 0; i < pages.length; i += 1) {
				if (
					// eslint-disable-next-line no-restricted-globals
					isNaN(pages[i])
					|| (i > 0 && pages[i] > 0 && pages[i] <= pages[i - 1])
					|| pages[i] < 0
					|| pages[i] > this.pageCount
				) return false;
			}

			return true;
		},
		updateParams(params) {
			Object.assign(this.params, params);

			if (!window.history) {
				return;
			}

			clearTimeout(this.paramsTimeout);
			this.paramsTimeout = setTimeout(() => {
				const storedParams = {};
				Object.keys(this.params).forEach((key) => {
					const param = this.params[key];
					if (
						param === null
						|| (key === 'pages' && param.length < 2 && param[0] < 2)
						|| (typeof param === 'object' && !Object.keys(param).length)
					) {
						delete storedParams[key];
					} else {
						storedParams[key] = this.params[key];
					}
				});

				const regex = /([?&])tify=.*?(&|$)/;
				const tifyParams = `tify=${JSON.stringify(storedParams)}`;
				const uri = window.location.href;
				const newUrl = uri.match(regex)
					? uri.replace(regex, `$1${tifyParams}$2`)
					: `${uri}${uri.indexOf('?') < 0 ? '?' : '&'}${tifyParams}`;

				if (params.pages) {
					this.error = '';
					window.history.pushState({}, '', newUrl);
				} else {
					window.history.replaceState({}, '', newUrl);
				}
			}, 100);
		},
	},
};
