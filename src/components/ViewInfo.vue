<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service

import { filterHtml } from '../modules/filter';
import { formatDate } from '../modules/formatting';
import { isValidUrl } from '../modules/validation';

export default {
	data() {
		return {
			collectionDataShown: false,
		};
	},
	computed: {
		hasProvider() {
			return this.manifestOrCollection.provider?.some(
				(provider) => this.$store.localize(provider.label)
					|| provider.homepage?.length,
			);
		},
		homepages() {
			// This must be an array as per IIIF docs, yet in some manifests it is not
			return [].concat(this.manifestOrCollection.homepage || []);
		},
		logos() {
			// This must be an array as per IIIF docs, yet in some manifests it is not
			let logos = [].concat(this.manifestOrCollection.logo || []);

			this.manifestOrCollection.provider?.forEach((provider) => {
				if (provider.logo) {
					logos = logos.concat(provider.logo);
				}
			});

			// Deduplicate logos
			logos = [...new Map(logos.map((logo) => [logo.id, logo])).values()];

			logos = logos.map((logo) => ({
				id: logo.id,
				link: logo.service?.[0]?.id || logo.service?.[0]?.['@id'],
			}));

			return logos;
		},
		manifestOrCollection() {
			if (this.collectionDataShown) {
				return this.$store.collection;
			}

			return this.$store.manifest || this.$store.collection || {};
		},
		metadataItems() {
			return this.$store.manifest.items
				.map((item, index) => ({ metadata: item.metadata, number: index + 1 }))
				.filter(({ metadata, number }) => metadata?.length && this.$store.options.pages.includes(number));
		},
		pages() {
			return this.$store.options.pages.filter((page) => page > 0).map((page) => {
				const pageItem = {
					page,
					media: [],
				};

				const items = this.$store.manifest.items[page - 1].items?.[0]?.items;

				items?.forEach((item) => {
					const resources = item.body?.items || [item.body];

					pageItem.media.push(
						...resources
							.filter((resource) => resource.label)
							.map((resource) => ({ label: resource.label })),
					);
				});

				return pageItem;
			});
		},
	},
	methods: {
		filterHtml,
		formatDate,
		isValidUrl,
	},
};
</script>

<template>
	<section
		class="tify-info"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Info') }}
		</h2>

		<div
			v-if="$store.collection && $store.manifest"
			class="tify-info-header"
		>
			<button
				type="button"
				class="tify-info-button"
				:aria-pressed="!collectionDataShown"
				@click="collectionDataShown = false"
			>
				{{ $translate('Document') }}
			</button>
			<button
				type="button"
				class="tify-info-button"
				:aria-pressed="collectionDataShown"
				@click="collectionDataShown = true"
			>
				{{ $translate('Collection') }}
			</button>
		</div>

		<div
			v-if="manifestOrCollection.label"
			class="tify-info-section -title"
		>
			<h3>{{ $translate('Title') }}</h3>
			<p>{{ $store.localize(manifestOrCollection.label) }}</p>
		</div>

		<div
			v-if="manifestOrCollection.navDate"
			class="tify-info-section -time"
		>
			<h3>{{ $translate('Date') }}</h3>
			<p>
				{{ formatDate(manifestOrCollection.navDate, $store.options.language) }}
			</p>
		</div>

		<div
			v-if="manifestOrCollection.navPlace"
			class="tify-info-section -place"
		>
			<h3>{{ $translate('Place') }}</h3>
			<p
				v-for="feature in manifestOrCollection.navPlace.features"
				:key="feature.id"
			>
				<!-- TODO: Add support for map coordinates -->
				{{ $store.localize(feature.properties.label) }}
			</p>
		</div>

		<div
			v-if="manifestOrCollection.metadata && manifestOrCollection.metadata.length"
			class="tify-info-section -metadata"
		>
			<h3>{{ $translate('Metadata') }}</h3>
			<MetadataList
				v-if="$store.options.view === 'info'"
				:metadata="manifestOrCollection.metadata"
			/>
		</div>

		<div
			v-if="manifestOrCollection.summary"
			class="tify-info-section -description"
		>
			<h3>{{ $translate('Description') }}</h3>
			<MetadataList
				v-if="$store.options.view === 'info'"
				:metadata="[{ value: manifestOrCollection.summary }]"
			/>
		</div>

		<div
			v-if="manifestOrCollection.structures
				&& ($store.currentStructure?.label || $store.currentStructure?.metadata)
			"
			class="tify-info-section -metadata -structure"
		>
			<h3>{{ $translate('Current Section') }}</h3>
			<p
				v-if="$store.currentStructure?.label"
				class="tify-info-structure"
			>
				{{ $store.localize($store.currentStructure.label) }}
			</p>
			<MetadataList
				v-if="$store.options.view === 'info' && $store.currentStructure?.metadata"
				class="tify-info-section -metadata"
				:metadata="$store.currentStructure.metadata"
			/>
		</div>

		<div
			v-if="manifestOrCollection.type === 'Manifest'"
			class="tify-info-section -pages"
		>
			<h3>{{ $translate(pages.length > 1 ? 'Current Pages' : 'Current Page') }}</h3>
			<ol class="tify-list -unstyled">
				<li
					v-for="page in pages"
					:key="page"
				>
					<PageName :number="page.page" />
					<ul
						v-if="page.media.length"
						class="tify-info-image-labels"
					>
						<li
							v-for="medium, index in page.media"
							:key="index"
						>
							{{ $store.localize(medium.label) }}
						</li>
					</ul>
					<MetadataList
						v-if="$store.manifest.items[page.page - 1].metadata"
						class="tify-info-section -metadata"
						:metadata="$store.manifest.items[page.page - 1].metadata"
					/>
				</li>
			</ol>
		</div>

		<div
			v-if="homepages.length"
			class="tify-info-section -related"
		>
			<h3>{{ $translate('Related Resources') }}</h3>
			<ul class="tify-list">
				<li
					v-for="(homepage, index) in homepages"
					:key="index"
				>
					<a
						v-if="typeof homepage === 'string'"
						:href="homepage"
					>
						{{ homepage }}
					</a>
					<a
						v-else
						:href="homepage.id"
					>
						{{ homepage.label ? $store.localize(homepage.label) : homepage.id }}
					</a>
				</li>
			</ul>
		</div>

		<div
			v-if="manifestOrCollection.requiredStatement"
			class="tify-info-section -attribution"
		>
			<h3>{{ $store.localize(manifestOrCollection.requiredStatement.label) }}</h3>
			<div v-html="filterHtml($store.localize(manifestOrCollection.requiredStatement.value))" />
		</div>

		<div
			v-if="manifestOrCollection.rights"
			class="tify-info-section -license"
		>
			<h3>{{ $translate('License') }}</h3>
			<p>
				<a :href="manifestOrCollection.rights">{{ manifestOrCollection.rights }}</a>
			</p>
		</div>

		<div
			v-if="hasProvider"
			class="tify-info-section -provider"
		>
			<h3>{{ $translate('Provided by') }}</h3>
			<div
				v-for="provider in manifestOrCollection.provider"
				:key="provider.id"
			>
				<p v-if="provider.label">
					{{ $store.localize(provider.label) }}
				</p>
				<ul
					v-if="provider.homepage?.length"
					class="tify-list"
				>
					<li
						v-for="homepage in provider.homepage"
						:key="homepage.id"
					>
						<a :href="homepage.id">
							{{ homepage.label ? $store.localize(homepage.label) : homepage.id }}
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div
			v-if="logos.length"
			class="tify-info-section -logo"
		>
			<p
				v-for="(logo, index) in logos"
				:key="index"
			>
				<a
					v-if="logo.link"
					:href="logo.link"
				>
					<!-- TODO: This alt string is not accessible, but there is no way to get a proper one -->
					<img
						class="tify-info-logo"
						:src="logo.id"
						:alt="$translate('Logo')"
					/>
				</a>
				<img
					v-else
					class="tify-info-logo"
					:src="logo.id"
					:alt="$translate('Logo')"
				/>
			</p>
		</div>
	</section>
</template>
