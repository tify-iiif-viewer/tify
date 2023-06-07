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
			<h3 class="tify-info-heading">
				{{ $translate('Title') }}
			</h3>
			<div
				v-for="label in $store.convertValueToArray(manifestOrCollection.label)"
				:key="label"
			>
				{{ label }}
			</div>
		</div>

		<div
			v-if="manifestOrCollection.metadata && manifestOrCollection.metadata.length"
			class="tify-info-section -metadata"
		>
			<h3>{{ $translate('Metadata') }}</h3>
			<metadata-list
				v-if="$store.options.view === 'info'"
				:metadata="manifestOrCollection.metadata"
			/>
		</div>

		<div
			v-if="manifestOrCollection.structures && ($store.currentStructure.label || $store.currentStructure.metadata)"
			class="tify-info-section -metadata -structure"
		>
			<h3>
				{{ $translate('Current Element') }}
			</h3>
			<p
				v-if="$store.currentStructure.label"
				class="tify-info-structure"
			>
				{{ $store.currentStructure.label }}
			</p>
			<metadata-list
				v-if="$store.options.view === 'info' && $store.currentStructure.metadata"
				class="tify-info-section -metadata"
				:metadata="$store.currentStructure.metadata"
			/>
		</div>

		<div
			v-if="manifestOrCollection.description"
			class="tify-info-section -description"
		>
			<h3>{{ $translate('Description') }}</h3>
			<div
				v-for="(description, index) in $store.convertValueToArray($store.manifest.description)"
				:key="index"
				v-html="description"
			/>
		</div>

		<div
			v-if="license.length"
			class="tify-info-section -license"
		>
			<h3>{{ $translate('License') }}</h3>
			<div
				v-for="(item, index) in license"
				:key="index"
			>
				<template v-if="typeof item === 'string'">
					<a
						v-if="isValidUrl(item)"
						:href="item"
					>
						{{ item }}
					</a>
					<template v-else>
						{{ item }}
					</template>
				</template>
				<template v-else>
					<a
						v-if="isValidUrl(item['@id'])"
						:href="item['@id']"
					>
						{{ item['label'] || item['@id'] }}
					</a>
					<template v-else>
						{{ item['label'] || item['@id'] }}
					</template>
				</template>
			</div>
		</div>

		<div
			v-if="related.length"
			class="tify-info-section -related"
		>
			<h3>{{ $translate('Related Resources') }}</h3>
			<div
				v-for="(item, index) in related"
				:key="index"
			>
				<a
					v-if="typeof item === 'string'"
					:href="item"
				>
					{{ item }}
				</a>
				<a
					v-else
					:href="item['@id']"
				>
					{{ item['label'] || item['@id'] }}
				</a>
			</div>
		</div>

		<div
			v-if="manifestOrCollection.attribution"
			class="tify-info-section -attribution"
		>
			<h3>{{ $translate('Provided by') }}</h3>
			<div
				v-for="(item, index) in $store.convertValueToArray($store.manifest.attribution)"
				:key="index"
				v-html="item"
			/>
		</div>

		<div
			v-if="manifestOrCollection.logo"
			class="tify-info-section -logo"
		>
			<a
				v-if="logoId && manifestOrCollection.logo.service && manifestOrCollection.logo.service['@id']"
				:href="manifestOrCollection.logo.service['@id']"
			>
				<img
					class="tify-info-logo"
					:src="logoId"
					:alt="$translate('Logo')"
				/>
			</a>
			<img
				v-else
				class="tify-info-logo"
				:src="logoId"
				:alt="$translate('Logo')"
			/>
		</div>
	</section>
</template>

<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service

import { isValidUrl } from '../modules/validation';

export default {
	data() {
		return {
			collectionDataShown: false,
		};
	},
	computed: {
		license() {
			return this.manifestOrCollection.license
				? this.$store.convertValueToArray(this.manifestOrCollection.license)
				: [];
		},
		logoId() {
			return this.manifestOrCollection.logo['@id'] || this.manifestOrCollection.logo;
		},
		manifestOrCollection() {
			if (this.collectionDataShown) {
				return this.$store.collection;
			}

			return this.$store.manifest || this.$store.collection;
		},
		related() {
			return this.manifestOrCollection.related
				? this.$store.convertValueToArray(this.manifestOrCollection.related)
				: [];
		},
	},
	methods: {
		isValidUrl,
	},
};
</script>
