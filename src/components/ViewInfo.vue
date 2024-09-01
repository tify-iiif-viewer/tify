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
				:class="{ '-active': !collectionDataShown }"
				@click="collectionDataShown = false"
			>
				{{ $translate('Document') }}
			</button>
			<button
				type="button"
				class="tify-info-button"
				:class="{ '-active': collectionDataShown }"
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
			v-if="manifestOrCollection.structures && ($store.currentStructure.label || $store.currentStructure.metadata)"
			class="tify-info-section -metadata -structure"
		>
			<h3>{{ $translate('Current Element') }}</h3>
			<p
				v-if="$store.currentStructure.label"
				class="tify-info-structure"
			>
				{{ $store.localize($store.currentStructure.label) }}
			</p>
			<MetadataList
				v-if="$store.options.view === 'info' && $store.currentStructure.metadata"
				class="tify-info-section -metadata"
				:metadata="$store.currentStructure.metadata"
			/>
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
						{{ $store.localize(homepage.label) || homepage.id }}
					</a>
				</li>
			</ul>
		</div>

		<div
			v-if="manifestOrCollection.requiredStatement"
			class="tify-info-section -attribution"
		>
			<h3>{{ $store.localize(manifestOrCollection.requiredStatement.label) }}</h3>
			<p v-html="filterHtml($store.localize(manifestOrCollection.requiredStatement.value))" />
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
			v-if="logos.length"
			class="tify-info-section -logo"
		>
			<p v-for="logo, index in logos" :key="index">
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

<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service

import { filterHtml } from '../modules/filter';
import { isValidUrl } from '../modules/validation';

export default {
	data() {
		return {
			collectionDataShown: false,
		};
	},
	computed: {
		manifestOrCollection() {
			if (this.collectionDataShown) {
				return this.$store.collection;
			}

			return this.$store.manifest || this.$store.collection || {};
		},
		homepages() {
			// This must be an array as per IIIF docs, yet on some servers it is not
			const homepages = this.manifestOrCollection.homepage
				? [].concat(this.manifestOrCollection.homepage)
				: [];

			return homepages;
		},
		logos() {
			// This must be an array as per IIIF docs, yet on some servers it is not
			let logos = this.manifestOrCollection.logo
				? [].concat(this.manifestOrCollection.logo)
				: [];

			this.manifestOrCollection.provider?.forEach((provider) => {
				if (provider.logo) {
					logos = logos.concat(provider.logo);
				}
			});

			logos = logos.map((logo) => ({
				id: logo.id,
				link: logo.service?.[0]?.id || logo.service?.[0]?.['@id'],
			}));

			return logos;
		},
	},
	methods: {
		filterHtml,
		isValidUrl,
	},
};
</script>
