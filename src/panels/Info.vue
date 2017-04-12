<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ 'Info'|trans }}</h2>

		<h3>{{ 'Metadata'|trans }}</h3>

		<table class="tify-info_list">
			<tr class="tify-info_row" v-for="item in manifest.metadata">
				<th class="tify-info_label">{{ item.label|formatLabel|trans }}</th>
				<td v-if="Array.isArray(item.value)" class="tify-info_text">
					<div v-for="value, index in item.value" v-html="formatValue(value)"></div>
				</td>
				<td v-else v-html="formatValue(item.value)" class="tify-info_text"></td>
			</tr>
		</table>

		<h3>{{ 'Attribution'|trans }}</h3>
		<p>{{ manifest.attribution }}</p>

		<template v-if="manifest.logo.id">
			<p>
				<img class="tify-info_logo" :src="manifest.logo.id" alt="">
			</p>
		</template>
	</section>
</template>

<script>
	export default {
		props: [
			'manifest',
		],
		filters: {
			formatLabel(label) {
				const cleanedLabel = label.replace('_', ' ');
				return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
			},
		},
		methods: {
			formatValue(value) {
				const filteredValue = this.$root.$options.filters.filterHtml(value);
				return this.$root.$options.filters.trans(filteredValue);
			},
		},
	};
</script>
