/* global Tify */

export default class Instance {
	constructor(options = {}) {
		this.colorMode = 'auto';
		this.contentStateActive = (new URL(window.location)).searchParams.get('iiif-content');
		this.id = options.id;
		this.language = options.language || 'en';
		this.manifestUrl = options.manifestUrl || '';
		this.sidebarOpen = false; // TODO: store in URL
		this.tify = null;
	}

	destroy() {
		this.manifestUrl = '';
		this.tify?.destroy();
		this.tify = null;

		const url = new URL(window.location);
		url.searchParams.delete(`language${this.id}`);
		url.searchParams.delete(`manifest${this.id}`);
		url.searchParams.delete(`tify${this.id}`);

		window.history.pushState(null, '', url.toString());
	}

	loadManifest(manifestUrl) {
		if (manifestUrl) {
			this.manifestUrl = manifestUrl;
		}

		this.tify?.destroy();

		const url = new URL(window.location);

		// Update URL query if manifest was changed via form input
		if (!this.contentStateActive
			&& url.searchParams.get(`manifest${this.id}`) !== this.manifestUrl
		) {
			url.searchParams.delete(`tify${this.id}`);
			url.searchParams.set(`manifest${this.id}`, this.manifestUrl);
			window.history.pushState(null, '', url.toString());
		}

		// TODO: Add section for adding custom TIFY options like translations

		this.tify = new Tify({
			container: document.getElementById(`container${this.id}`),
			colorMode: this.colorMode,
			contentStateEnabled: this.contentStateActive,
			manifestUrl: this.manifestUrl,
			translationsDirUrl: 'translations',
			language: this.language,
			urlQueryKey: `tify${this.id}`,
		});

		// TODO
		// eslint-disable-next-line
		if (this.tify.app._container.offsetWidth <= 719) {
			this.sidebarOpen = false;
		}

		// Expose latest instance for e2e tests
		window.tify = this.tify;
	}

	setLanguage(code) {
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
}
