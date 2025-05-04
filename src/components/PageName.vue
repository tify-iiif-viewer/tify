<script>
export default {
	props: {
		number: {
			type: Number,
			required: true,
		},
		multiline: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		label() {
			return this.$store.localize(this.$store.manifest.items[this.number - 1].label);
		},
	},
};
</script>

<template>
	<span class="tify-page-name" :class="{ '-multiline': multiline }">
		<span
			v-for="key in $store.options.pageNameParts"
			:key="key"
			:class="`tify-page-name-${key}`"
			:title="key === 'label' ? label : null"
		>
			<!-- Adding spaces for screenreaders -->
			{{ key === 'label' ? `${label} ` : `${this[key]} ` }}
		</span>
	</span>
</template>
