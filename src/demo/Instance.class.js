/* global Tify */

export default class Instance {
	constructor(options = {}) {
		this.colorMode = 'auto'; // TODO: Store in URL?
		this.hasContentState = !!(new URL(window.location)).searchParams.get('iiif-content');
		this.id = options.id;
		this.language = options.language || 'en';
		this.manifestUrl = options.manifestUrl || '';
		this.sidebarOpen = false; // TODO: Store in URL?
		this.tify = null;
	}

	destroy() {
		this.manifestUrl = '';
		this.tify?.destroy();
		this.tify = null;

		Instance.updateDocumentTitle();

		const url = new URL(window.location);
		url.searchParams.delete(`language${this.id}`);
		url.searchParams.delete(`manifest${this.id}`);
		url.searchParams.delete(`tify${this.id}`);

		window.history.pushState(null, '', url.toString());
	}

	initTify(manifestUrl) {
		if (manifestUrl) {
			this.manifestUrl = manifestUrl;
		}

		this.tify?.destroy();

		const url = new URL(window.location);

		// Update URL query if manifest was changed via form input
		if (!this.hasContentState
			&& url.searchParams.get(`manifest${this.id}`) !== this.manifestUrl
		) {
			url.searchParams.delete('iiif-content');
			url.searchParams.delete(`tify${this.id}`);
			url.searchParams.set(`manifest${this.id}`, this.manifestUrl);
			window.history.pushState(null, '', url.toString());
		}

		// TODO: Allow to add custom TIFY options like translation overrides

		this.tify = new Tify({
			container: document.getElementById(`container${this.id}`),
			colorMode: this.colorMode,
			contentStateEnabled: this.hasContentState,
			language: this.language,
			manifestUrl: this.manifestUrl,
			translationsDirUrl: 'translations',
			urlQueryKey: `tify${this.id}`,
		});

		this.tify.ready.then(() => Instance.updateDocumentTitle());

		// eslint-disable-next-line no-underscore-dangle
		if (window.getComputedStyle(this.tify.app._container.firstChild, '::after').content !== '"wide"') {
			this.sidebarOpen = false;
		}

		this.hasContentState = false;

		// Expose latest instance for e2e tests
		window.tify = this.tify;
	}

	async setLanguage(code) {
		this.language = code;
		this.tify?.setLanguage(code);

		const url = new URL(window.location);
		if (code === 'en') {
			url.searchParams.delete(`language${this.id}`);
		} else {
			url.searchParams.set(`language${this.id}`, code);
		}
		window.history.pushState(null, '', url.toString());
	}

	// TODO: Add test
	static updateDocumentTitle() {
		const titles = document.querySelectorAll('.tify-header-title');
		document.title = `TIFY${[...titles].map((title) => ` · ${title.textContent}`).join('')}`;
	}
}
