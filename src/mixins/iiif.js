import striptags from 'striptags';

export default {
	methods: {
		convertValueToArray(value) {
			// http://iiif.io/api/presentation/2.1/#language-of-property-values

			if (!(value instanceof Array)) {
				if (typeof value === 'object') {
					if (value['@value']) {
						return [this.filterHtml(value['@value'])];
					}

					if (value['@id']) {
						const id = this.filterHtml(value['@id']);
						return [{ '@id': id, label: (value.label ? this.filterHtml(value.label) : id) }];
					}

					return ['(Invalid value)'];
				}

				return [this.filterHtml(value)];
			}

			const displayedValues = [];
			const translation = {};
			value.forEach((item) => {
				if (typeof item === 'string' || (item['@id'] && item.label)) {
					displayedValues.push(item);
				} else if (item && typeof item !== 'object') {
					displayedValues.push(this.filterHtml(item));
				} else if (item['@language'] && item['@value']) {
					if (!translation.fallback) {
						translation.fallback = item['@value'];
					}

					if (item['@language'].indexOf('en') === 0) {
						// Language is en or en-US or en-GB
						translation.en = item['@value'];
					} else if (item['@language'] === this.options.language) {
						translation.preferred = item['@value'];
					}
				}
			});

			const translatedValue = (
				translation.preferred
				|| translation.en
				|| translation.fallback
				|| null
			);
			if (translatedValue) {
				displayedValues.push(this.filterHtml(translatedValue));
			}

			return displayedValues;
		},
		filterHtml(html) {
			// See http://iiif.io/api/presentation/2.1/#html-markup-in-property-values
			const allowedTags = ['a', 'b', 'br', 'i', 'img', 'p', 'span'];
			const allowedAttributes = { a: ['href'], img: ['alt', 'src'] };

			// TODO: striptags removes '<' and '>' inside attribute values
			let filteredHtml = striptags(html, allowedTags);

			// Iterate over all opening (including self-closing) HTML tags
			const htmlTagsRegex = /<(\w+)((\s+.+?(\s*=\s*(?:".*?"|'.*?'|.*?|[\^'">\s]+))?)+\s*|\s*)>/g;
			filteredHtml = filteredHtml.replace(htmlTagsRegex, (match, tag, attributes) => {
				if (!attributes) {
					return `<${tag}>`;
				}

				// Iterate over all attributes and keep only allowed ones
				const attributesRegex = /(?:([^\s]+)=(?:"(.*?)"|'(.*?)'))|([^\s]+)/g;
				const keptAttributes = [];
				attributes.replace(attributesRegex, (tuple, key) => {
					if (tuple !== key && allowedAttributes[tag] && allowedAttributes[tag].indexOf(key) > -1) {
						keptAttributes.push(tuple);
					}
				});

				return (keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`);
			});

			return filteredHtml;
		},
		loadManifest(manifestUrl, options = {}) {
			let resolveFunction;
			let rejectFunction;
			const promise = new Promise((resolve, reject) => {
				resolveFunction = resolve;
				rejectFunction = reject;
			});

			return this.$http.get(manifestUrl).then(async (response) => {
				if (options.expectedType && response.data['@type'] !== options.expectedType) {
					this.error = `Expected manifest of type ${options.expectedType}, but got ${response.data['@type']}`;
					rejectFunction(this.error);
					return promise;
				}

				// Force re-render of all components that depend on the manifest
				this.manifest = null;
				await this.$nextTick();

				if (response.data['@type'] === 'sc:Manifest') {
					this.manifest = response.data;

					// Merging user-set query params with defaults
					this.updateOptionsFromUrlQuery();
					window.addEventListener('popstate', this.updateOptionsFromUrlQuery);

					if (options.reset) {
						this.updateOptions({
							childManifestUrl: manifestUrl,
							pages: [this.getStartPage()],
							pan: {},
							rotation: null,
							view: this.isMobile() ? 'scan' : 'collection',
							zoom: null,
						});
					}

					resolveFunction();
					return promise;
				} if (response.data['@type'] === 'sc:Collection') {
					this.collection = response.data;

					const query = new URLSearchParams(window.location.search);
					let queryParams = {};
					try {
						queryParams = JSON.parse(query.get(this.options.urlQueryKey)) || {};
					} catch {
						// Nothing to do here
					}

					let childManifestUrl = '';

					if (this.options.urlQueryParams.includes('childManifestUrl')
						&& queryParams.childManifestUrl
					) {
						childManifestUrl = queryParams.childManifestUrl;
					} else if (this.collection.manifests
						&& this.options.childManifestAutoloaded
					) {
						childManifestUrl = this.collection.manifests[0]['@id'];
					}

					if (childManifestUrl) {
						await this.loadManifest(childManifestUrl, { expectedType: 'sc:Manifest' });
					} else {
						const view = queryParams.view || this.options.view;
						this.updateOptions({
							view: ['collection', 'help', 'info'].includes(view) ? view : 'collection',
						});
					}

					resolveFunction();
					return promise;
				}

				this.error = 'Please provide a valid IIIF Presentation API 2.x manifest';
				rejectFunction(this.error);
				return promise;
			}, (error) => {
				const status = error.response ? (error.response.statusText || error.response.data) : error.message;
				this.error = `Error loading IIIF manifest: ${status}`;
				rejectFunction(this.error);
				return promise;
			});
		},
	},
};
