<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ 'Info'|trans }}</h2>

		<div v-if="manifest.label" class="tify-info_section -title">
			<h3 class="tify-info_heading">{{ 'Title'|trans }}</h3>
			<div :key="label" v-for="label in getLabels(manifest.label)">
				{{ label }}
			</div>
		</div>

		<div v-if="manifest.metadata && manifest.metadata.length" class="tify-info_section -metadata">
			<h3>{{ 'Metadata'|trans }}</h3>
			<metadata-list :metadata="manifest.metadata"/>
		</div>

		<div v-if="currentStructureLabel || currentStructureMetadata" class="tify-info_section -metadata -structure">
			<h3>
				{{ 'Current Element'|trans }}
			</h3>
			<p v-if="currentStructureLabel" class="tify-info_structure">
				{{ currentStructureLabel }}
			</p>
			<metadata-list
				v-if="currentStructureMetadata"
				class="tify-info_section -metadata"
				:metadata="currentStructureMetadata"
			/>
		</div>

		<div v-if="manifest.description" class="tify-info_section -description">
			<h3>{{ 'Description'|trans }}</h3>
			<div
				:key="index"
				v-for="(description, index) in getLabels(manifest.description)"
				v-html="description"/>
		</div>

		<div v-if="license.length" class="tify-info_section -license">
			<h3>{{ 'License'|trans }}</h3>
			<div :key="index" v-for="(item, index)  in license">
				<template v-if="typeof item === 'string'">
					<a v-if="isUrl(item)" :href="item">
						{{ item }}
					</a>
					<template v-else>
						{{ item }}
					</template>
				</template>
				<template v-else :href="item['@id']">
					<a v-if="isUrl(item['@id'])" :href="item">
						{{ item['label'] || item['@id'] }}
					</a>
					<template v-else>
						{{ item['label'] || item['@id'] }}
					</template>
				</template>
			</div>
		</div>

		<div v-if="related.length" class="tify-info_section -related">
			<h3>{{ 'Related Resources'|trans }}</h3>
			<div :key="index" v-for="(item, index)  in related">
				<a v-if="typeof item === 'string'" :href="item">
					{{ item }}
				</a>
				<a v-else :href="item['@id']">
					{{ item['label'] || item['@id'] }}
				</a>
			</div>
		</div>

		<div v-if="manifest.attribution" class="tify-info_section -attribution">
			<h3>{{ 'Provided by'|trans }}</h3>
			<div :key="index" v-for="(item, index) in getLabels(manifest.attribution)" v-html="item"/>
		</div>

		<div v-if="manifest.logo" class="tify-info_section -logo">
			<a
				v-if="logoId && manifest.logo.service && manifest.logo.service['@id']"
				:href="manifest.logo.service['@id']"
			>
				<img class="tify-info_logo" :src="logoId" alt="">
			</a>
			<img v-else class="tify-info_logo" :src="logoId" alt="">
		</div>
	</section>
</template>

<script>
// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service
import MetadataList from '@/components/MetadataList';

import structures from '@/mixins/structures';

export default {
	components: {
		MetadataList,
	},
	mixins: [
		structures,
	],
	data() {
		return {
			collapsedStyle: '',
		};
	},
	computed: {
		license() {
			return this.manifest.license ? this.getLabels(this.manifest.license) : [];
		},
		logoId() {
			return (this.manifest.logo['@id'] ? this.manifest.logo['@id'] : this.manifest.logo);
		},
		manifest() {
			return this.$root.manifest;
		},
		related() {
			return this.manifest.related ? this.getLabels(this.manifest.related) : [];
		},
	},
	methods: {
		init() {
			this.isInited = true;
		},
		isUrl(string) {
			// Poor man's URL check
			return /^https?:\/\//.test(string);
		},
		getLabels(value) {
			return this.$root.convertValueToArray(value);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$root.params.view': function (view) {
			if (view === 'info') {
				if (!this.isInited) this.init();
			}
		},
	},
	mounted() {
		if (this.$root.params.view === 'info') this.init();
	},
};
</script>
