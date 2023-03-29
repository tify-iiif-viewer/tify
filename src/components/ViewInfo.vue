<template>
	<section
		class="tify-info"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ translate('Info') }}
		</h2>

		<div
			v-if="collection['@id'] && manifest['@id']"
			class="tify-info-header"
		>
			<button
				type="button"
				class="tify-info-button"
				:class="{ '-active': !collectionDataShown }"
				@click="collectionDataShown = false"
			>
				{{ translate('Document') }}
			</button>
			<button
				type="button"
				class="tify-info-button"
				:class="{ '-active': collectionDataShown }"
				@click="collectionDataShown = true"
			>
				{{ translate('Collection') }}
			</button>
		</div>

		<div
			v-if="manifest.label"
			class="tify-info-section -title"
		>
			<h3 class="tify-info-heading">
				{{ translate('Title') }}
			</h3>
			<div
				v-for="label in convertValueToArray(manifest.label)"
				:key="label"
			>
				{{ label }}
			</div>
		</div>

		<div
			v-if="manifest.metadata && manifest.metadata.length"
			class="tify-info-section -metadata"
		>
			<h3>{{ translate('Metadata') }}</h3>
			<metadata-list
				v-if="options.view === 'info'"
				:metadata="manifest.metadata"
			/>
		</div>

		<div
			v-if="manifest.structures && (currentStructureLabel || currentStructureMetadata)"
			class="tify-info-section -metadata -structure"
		>
			<h3>
				{{ translate('Current Element') }}
			</h3>
			<p
				v-if="currentStructureLabel"
				class="tify-info-structure"
			>
				{{ currentStructureLabel }}
			</p>
			<metadata-list
				v-if="options.view === 'info' && currentStructureMetadata"
				class="tify-info-section -metadata"
				:metadata="currentStructureMetadata"
			/>
		</div>

		<div
			v-if="manifest.description"
			class="tify-info-section -description"
		>
			<h3>{{ translate('Description') }}</h3>
			<div
				v-for="(description, index) in convertValueToArray(manifest.description)"
				:key="index"
				v-html="description"
			/>
		</div>

		<div
			v-if="license.length"
			class="tify-info-section -license"
		>
			<h3>{{ translate('License') }}</h3>
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
			<h3>{{ translate('Related Resources') }}</h3>
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
			v-if="manifest.attribution"
			class="tify-info-section -attribution"
		>
			<h3>{{ translate('Provided by') }}</h3>
			<div
				v-for="(item, index) in convertValueToArray(manifest.attribution)"
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
				<img
					class="tify-info-logo"
					:src="logoId"
					:alt="translate('Logo')"
				/>
			</a>
			<img
				v-else
				class="tify-info-logo"
				:src="logoId"
				:alt="translate('Logo')"
			/>
		</div>
	</section>
</template>

<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service

import { translate } from '../modules/i18n';
import { convertValueToArray } from '../modules/iiif';
import { collection, manifest, options } from '../modules/store';
import { currentStructure, currentStructureMetadata, currentStructureLabel } from '../modules/structures';
import { isValidUrl } from '../modules/validation';

export default {
	data() {
		return {
			currentStructure,
			currentStructureLabel,
			currentStructureMetadata,
			collectionDataShown: false,
			options,
		};
	},
	computed: {
		collection() {
			return collection;
		},
		license() {
			return manifest.license ? convertValueToArray(this.manifest.license) : [];
		},
		logoId() {
			return manifest.logo['@id'] || manifest.logo;
		},
		manifest() {
			return this.collectionDataShown ? collection : (manifest || collection);
		},
		related() {
			return manifest.related ? convertValueToArray(manifest.related) : [];
		},
	},
	methods: {
		convertValueToArray,
		isValidUrl,
		translate,
	},
};
</script>
