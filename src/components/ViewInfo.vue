<template>
	<section class="tify-info" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Info') }}</h2>

		<div
			v-if="$root.collection && $root.manifest"
			class="tify-info-header"
		>
			<button
				class="tify-info-button"
				:class="{ '-active': !collectionDataShown }"
				@click="collectionDataShown = false"
			>
				{{ $root.translate('Document') }}
			</button>
			<button
				v-if="$root.collection && $root.manifest"
				class="tify-info-button"
				:class="{ '-active': collectionDataShown }"
				@click="collectionDataShown = true"
			>
				{{ $root.translate('Collection') }}
			</button>
		</div>

		<div
			v-if="manifest.label"
			class="tify-info-section -title"
		>
			<h3 class="tify-info-heading">{{ $root.translate('Title') }}</h3>
			<div :key="label" v-for="label in $root.convertValueToArray(manifest.label)">
				{{ label }}
			</div>
		</div>

		<div
			v-if="manifest.metadata && manifest.metadata.length"
			class="tify-info-section -metadata"
		>
			<h3>{{ $root.translate('Metadata') }}</h3>
			<metadata-list v-if="$root.options.view === 'info'" :metadata="manifest.metadata"/>
		</div>

		<div
			v-if="manifest.structures && (currentStructureLabel || currentStructureMetadata)"
			class="tify-info-section -metadata -structure"
		>
			<h3>
				{{ $root.translate('Current Element') }}
			</h3>
			<p v-if="currentStructureLabel" class="tify-info-structure">
				{{ currentStructureLabel }}
			</p>
			<metadata-list
				v-if="$root.options.view === 'info' && currentStructureMetadata"
				class="tify-info-section -metadata"
				:metadata="currentStructureMetadata"
			/>
		</div>

		<div
			v-if="manifest.description"
			class="tify-info-section -description"
		>
			<h3>{{ $root.translate('Description') }}</h3>
			<div
				:key="index"
				v-for="(description, index) in $root.convertValueToArray(manifest.description)"
				v-html="description"/>
		</div>

		<div
			v-if="license.length"
			class="tify-info-section -license"
		>
			<h3>{{ $root.translate('License') }}</h3>
			<div :key="index" v-for="(item, index)  in license">
				<template v-if="typeof item === 'string'">
					<a v-if="isValidUrl(item)" :href="item">
						{{ item }}
					</a>
					<template v-else>
						{{ item }}
					</template>
				</template>
				<template v-else>
					<a v-if="isValidUrl(item['@id'])" :href="item['@id']">
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
			<h3>{{ $root.translate('Related Resources') }}</h3>
			<div v-for="(item, index) in related" :key="index">
				<a v-if="typeof item === 'string'" :href="item">
					{{ item }}
				</a>
				<a v-else :href="item['@id']">
					{{ item['label'] || item['@id'] }}
				</a>
			</div>
		</div>

		<div
			v-if="manifest.attribution"
			class="tify-info-section -attribution"
		>
			<h3>{{ $root.translate('Provided by') }}</h3>
			<div
				v-for="(item, index) in $root.convertValueToArray(manifest.attribution)"
				:key="index"
				v-html="item"
			/>
		</div>

		<div
			v-if="manifest.logo"
			class="tify-info-section -logo"
		>
			<a
				v-if="logoId && manifest.logo.service && manifest.logo.service['@id']"
				:href="manifest.logo.service['@id']"
			>
				<img class="tify-info-logo" :src="logoId" :alt="$root.translate('Logo')">
			</a>
			<img v-else class="tify-info-logo" :src="logoId" :alt="$root.translate('Logo')">
		</div>
	</section>
</template>

<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service
import MetadataList from './MetadataList';

import structures from '../mixins/structures';

import isValidUrl from '../functions/isValidUrl';

export default {
	components: {
		MetadataList,
	},
	mixins: [
		structures,
	],
	data() {
		return {
			collectionDataShown: false,
		};
	},
	computed: {
		collection() {
			return this.$root.collection;
		},
		license() {
			return this.manifest.license ? this.$root.convertValueToArray(this.manifest.license) : [];
		},
		logoId() {
			return (this.manifest.logo['@id'] ? this.manifest.logo['@id'] : this.manifest.logo);
		},
		manifest() {
			return this.collectionDataShown ? this.$root.collection : (this.$root.manifest || this.$root.collection);
		},
		related() {
			return this.manifest.related ? this.$root.convertValueToArray(this.manifest.related) : [];
		},
	},
	methods: {
		isValidUrl,
	},
};
</script>
