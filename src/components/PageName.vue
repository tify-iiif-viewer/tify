<script>
import striptags from 'striptags';

export default {
	props: {
		number: {
			type: Number,
			required: true,
		},
		wrap: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		label() {
			return striptags(this.$store.localize(this.$store.manifest.items[this.number - 1].label))
				|| this.$translate('$n/a');
		},
		html() {
			return `<span>${this.$store.options.pageLabelFormat}</span>`
				.replace('L', `</span>${this.label}<span>`)
				.replace('P', `${this.number}`)
				.replace('T', `${this.$store.pageCount}`)
				.replace('<span></span>', '');
		},
	},
};
</script>

<template>
	<span
		class="tify-page-name"
		:class="{ '-wrap': wrap }"
		v-html="html"
	/>
</template>
