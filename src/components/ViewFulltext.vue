<template>
	<section
		class="tify-fulltext"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Fulltext') }}
		</h2>

		<div
			v-if="fulltextAvailable !== false"
			ref="texts"
			class="tify-fulltext-texts"
		>
			<div
				v-for="page in pages"
				:key="page"
				class="tify-fulltext-page"
			>
				<h3>
					{{ $translate('Page') }}
					{{ $store.getPageLabel(page, $store.localize($store.manifest.items[page - 1].label)) }}
				</h3>
				<ul class="tify-fulltext-list">
					<li
						v-for="(item, index) in fulltexts[page]"
						:key="`${page}-${index}`"
						:class="current.page === page && current.index === index ? '-current' : ''"
					>
						<a
							class="tify-fulltext-link"
							href="javascript:;"
							@click="toggleOverlay(page, index)"
							v-html="filterHtml(item.html)"
						/>
					</li>
				</ul>
			</div>
		</div>

		<p
			v-else
			class="tify-fulltext-none"
		>
			{{ $translate('Fulltext not available for this page') }}
		</p>
	</section>
</template>

<script>
import OpenSeadragon from 'openseadragon';

import { filterHtml } from '../modules/filter';
import { isValidUrl } from '../modules/validation';

export default {
	data() {
		return {
			current: {},
			fulltextAvailable: null,
			fulltexts: [],
		};
	},
	computed: {
		pages() {
			return this.$store.options.pages.filter((page) => !!page);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.pages': function () {
			this.loadFulltexts();
		},
		// eslint-disable-next-line func-names
		'$store.options.view': function (view) {
			if (view === 'fulltext') {
				this.$nextTick(this.loadFulltexts);
			} else {
				this.$root.viewer.clearOverlays();
			}
		},
	},
	mounted() {
		// TODO: Merge with watcher
		if (this.$store.options.view === 'fulltext') {
			this.$nextTick(this.loadFulltexts);
		}
	},
	methods: {
		filterHtml,
		loadFulltexts() {
			this.current = {};
			this.fulltextAvailable = null;
			this.fulltexts = [];

			// TODO: Wait for viewer to be ready before adding overlays, otherwise
			// overlays are not always displayed

			const firstCanvasWidth = (this.$store.manifest.items[this.$store.options.pages[0] - 1]).width;

			this.$store.options.pages.forEach((page, pageIndex) => {
				if (page < 1 || this.fulltexts[page]) {
					return;
				}

				const canvas = this.$store.manifest.items[page - 1];
				if (!('annotations' in canvas)) {
					this.fulltextAvailable = false;
					return;
				}

				const annotationListUrl = canvas.annotations[0].id;

				this.$store.fetchJson(annotationListUrl).then(
					(data) => {
						const { resources } = data;
						if (!(resources instanceof Array)) {
							return;
						}

						resources.forEach(async (resource, index) => {
							const res = resource.resource;

							if (!res) {
								return;
							}

							if (!this.fulltexts[page]) {
								this.fulltexts[page] = [];
							}

							let html;
							if (res?.chars || res?.label) {
								if (res.chars) {
									html = res.chars;
								} else if (res.label) {
									html = `<i>${res.label}</i>`;
								}
							} else if (res?.id || res?.['@id']) {
								html = await this.loadRemoteFulltext(res.id || res['@id']);
							}

							if (!html) {
								return;
							}

							// TODO: Evaluate all annotation metadata, see e.g.
							// https://iiif.wellcomecollection.org/annotations/v2/b20417081_001/b20417081_001_0107.jp2/line

							this.fulltexts[page][index] = { html };

							const coordsPos = resource.on?.indexOf('#xywh=');
							if (coordsPos > -1) {
								// TODO: Validate more?
								const coords = resource.on
									.substring(coordsPos + 6)
									.split(',')
									.map((number) => (parseFloat(number) / canvas.width) * (canvas.width / firstCanvasWidth));

								if (coords.length === 4) {
									const el = document.createElement('a');

									el.className = 'tify-scan-overlay'
										+ `${this.current.page === page && this.current.index === index ? ' -current' : ''}`;
									// TODO: el.href = 'javascript:;';
									// TODO: el.textContent = this.fulltexts[page][index].html;

									el.addEventListener('click', () => {
										// TODO: This is not working, in this context this is not available inside toggleOverlay
										this.$options.methods.toggleOverlay(page, index, this);

										// TODO: Scroll into view
									});

									this.fulltexts[page][index].overlay = el;

									// TODO: Fix position if multiple pages are displayed
									// TODO: Move to scan component?
									this.$root.viewer.addOverlay({
										element: el,
										// TODO: 1.01 = gap between pages, see scan component
										location: new OpenSeadragon.Rect(
											// TODO: This only works for 1 or 2 pages, but when there are more, x-pos is off
											coords[0] + (pageIndex * 1.01),
											coords[1],
											coords[2],
											coords[3],
										),
									});
								}
							}
						});
					},
					(error) => {
						const status = error.response ? error.response.statusText : error.message;
						// eslint-disable-next-line no-console
						console.warn(`Could not load annotations: ${status}`);
						this.fulltextAvailable = false;
					},
				);
			});
		},
		async loadRemoteFulltext(url) {
			// TODO: Add support for dctypes

			if (!isValidUrl(url)) {
				return null;
			}

			return this.$store.fetchText(url).then(
				// TODO: Prettify this
				() => {},
				(error) => {
					const status = error.response ? error.response.statusText : error.message;
					// eslint-disable-next-line no-console
					console.warn(`Could not load fulltext: ${status}`);
				},
			);
		},
		// TODO: Explain "context"
		toggleOverlay(page, index, context) {
			const ctx = context || this;

			if (ctx.fulltexts[ctx.current.page]) {
				ctx.fulltexts[ctx.current.page][ctx.current.index].overlay.classList.remove('-current');
			}

			ctx.fulltexts[page][index].overlay.classList.add('-current');

			ctx.current = { page, index };

			ctx.$nextTick(() => {
				ctx.$refs.texts.querySelector('.-current')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			});
		},
	},
};
</script>
