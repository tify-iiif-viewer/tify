<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ $root.translate('Info') }}</h2>

		<div v-if="manifest.label" class="tify-info_section -title">
			<h3 class="tify-info_heading">{{ $root.translate('Title') }}</h3>
			<div :key="label" v-for="label in $root.convertValueToArray(manifest.label)">
				{{ label }}
			</div>
		</div>

		<div v-if="manifest.metadata && manifest.metadata.length" class="tify-info_section -metadata">
			<h3>{{ $root.translate('Metadata') }}</h3>
			<metadata-list v-if="$root.options.view === 'info'" :metadata="manifest.metadata"/>
		</div>

		<div v-if="currentStructureLabel || currentStructureMetadata" class="tify-info_section -metadata -structure">
			<h3>
				{{ $root.translate('Current Element') }}
			</h3>
			<p v-if="currentStructureLabel" class="tify-info_structure">
				{{ currentStructureLabel }}
			</p>
			<metadata-list
				v-if="$root.options.view === 'info' && currentStructureMetadata"
				class="tify-info_section -metadata"
				:metadata="currentStructureMetadata"
			/>
		</div>

		<div v-if="manifest.description" class="tify-info_section -description">
			<h3>{{ $root.translate('Description') }}</h3>
			<div
				:key="index"
				v-for="(description, index) in $root.convertValueToArray(manifest.description)"
				v-html="description"/>
		</div>

		<div v-if="license.length" class="tify-info_section -license">
			<h3>{{ $root.translate('License') }}</h3>
			<div :key="index" v-for="(item, index)  in license">
				<template v-if="typeof item === 'string'">
					<a v-if="isUrl(item)" :href="item">
						{{ item }}
					</a>
					<template v-else>
						{{ item }}
					</template>
				</template>
				<template v-else>
					<a v-if="isUrl(item['@id'])" :href="item['@id']">
						{{ item['label'] || item['@id'] }}
					</a>
					<template v-else>
						{{ item['label'] || item['@id'] }}
					</template>
				</template>
			</div>
		</div>

		<div v-if="related.length" class="tify-info_section -related">
			<h3>{{ $root.translate('Related Resources') }}</h3>
			<div :key="index" v-for="(item, index)  in related">
				<a v-if="typeof item === 'string'" :href="item">
					{{ item }}
				</a>
				<a v-else :href="item['@id']">
					{{ item['label'] || item['@id'] }}
				</a>
			</div>
		</div>

		<div class="tify-info_section -manifest">
			<h3>{{ $root.translate('IIIF Manifest') }}</h3>
			<a :href="this.$root.manifestUrl">{{ this.$root.manifestUrl }}</a>
		</div>

		<div v-if="manifest.attribution" class="tify-info_section -attribution">
			<h3>{{ $root.translate('Provided by') }}</h3>
			<div :key="index" v-for="(item, index) in $root.convertValueToArray(manifest.attribution)" v-html="item"/>
		</div>

		<div v-if="manifest.logo" class="tify-info_section -logo">
			<a
				v-if="logoId && manifest.logo.service && manifest.logo.service['@id']"
				:href="manifest.logo.service['@id']"
			>
				<img class="tify-info_logo" :src="logoId" :alt="$root.translate('Logo')">
			</a>
			<img v-else class="tify-info_logo" :src="logoId" :alt="$root.translate('Logo')">
		</div>
	</section>
</template>

<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service
import MetadataList from './MetadataList';

import structures from '../mixins/structures';

export default {
	components: {
		MetadataList,
	},
	mixins: [
		structures,
	],
	computed: {
		license() {
			return this.manifest.license ? this.$root.convertValueToArray(this.manifest.license) : [];
		},
		logoId() {
			return (this.manifest.logo['@id'] ? this.manifest.logo['@id'] : this.manifest.logo);
		},
		manifest() {
			return this.$root.manifest;
		},
		related() {
			return this.manifest.related ? this.$root.convertValueToArray(this.manifest.related) : [];
		},
	},
	methods: {
		isUrl(string) {
			// Poor man's URL check
			return /^https?:\/\//.test(string);
		},
	},
};
</script>
