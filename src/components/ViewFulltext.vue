<template>
	<section
		class="tify-fulltext"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ translate('Fulltext') }}
		</h2>

		<div
			v-if="fulltextAvailable"
			class="tify-fulltext-texts"
		>
			<div
				v-for="page in pages"
				:key="page"
				class="tify-fulltext-page"
			>
				<h3>
					{{ translate('Page') }}
					{{ getPageLabel(page, canvases[page - 1].label) }}
				</h3>
				<div
					v-for="(text, index) in fulltexts[page]"
					:key="`${page}-${index}`"
					class="tify-fulltext-text"
					v-html="text"
				/>
			</div>
		</div>

		<div
			v-else
			class="tify-fulltext-none"
		>
			{{ translate('Fulltext not available for this page') }}
		</div>
	</section>
</template>

<script>
import { fetchText, fetchJson } from '../modules/http';
import { translate } from '../modules/i18n';
import { filterHtml, getPageLabel } from '../modules/iiif';
import { isValidUrl } from '../modules/validation';
import { canvases, manifest, options } from '../modules/store';

export default {
	data() {
		return {
			canvases,
			fulltextAvailable: false,
			fulltexts: [],
			options,
		};
	},
	computed: {
		pages() {
			return options.pages.filter((page) => !!page);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'options.pages': function () {
			this.loadFulltexts();
		},
	},
	mounted() {
		this.loadFulltexts();
	},
	methods: {
		getPageLabel,
		loadFulltexts() {
			this.fulltextAvailable = false;
			this.fulltexts = [];

			options.pages.forEach((page) => {
				if (page < 1 || this.fulltexts[page]) {
					return;
				}

				const canvas = manifest.sequences[0].canvases[page - 1];
				if (!('otherContent' in canvas)) {
					return;
				}

				const annotationListUrl = canvas.otherContent[0]['@id'];

				fetchJson(annotationListUrl).then(
					(data) => {
						const { resources } = data;
						if (!Array.isArray(resources)) {
							return;
						}

						resources.forEach((resource, index) => {
							const res = resource.resource;

							if (!res) {
								return;
							}

							if (!this.fulltexts[page]) {
								this.fulltexts[page] = [];
							}

							if (res && res.chars) {
								const text = filterHtml(res.chars);
								if (text) {
									this.fulltextAvailable = true;
								}

								this.fulltexts[page][index] = text;
							} else if (res['@id']) {
								this.loadRemoteFulltext(page, index, res['@id']);
							}
						});
					},
					(error) => {
						const status = error.response ? error.response.statusText : error.message;
						// eslint-disable-next-line no-console
						console.warn(`Could not load annotations: ${status}`);
					},
				);
			});
		},
		loadRemoteFulltext(page, index, url) {
			// Only attempt to load remote fulltext if we got a valid URL
			// TODO: Add support for dctypes
			if (!isValidUrl(url)) {
				return;
			}

			fetchText(url).then(
				(html) => {
					const text = filterHtml(html);
					if (text) {
						this.fulltextAvailable = true;
					}

					if (!this.fulltexts[page]) {
						this.fulltexts[page] = [];
					}

					this.fulltexts[page][index] = text;
				},
				(error) => {
					const status = error.response ? error.response.statusText : error.message;
					// eslint-disable-next-line no-console
					console.warn(`Could not load fulltext: ${status}`);
				},
			);
		},
		translate,
	},
};
</script>
