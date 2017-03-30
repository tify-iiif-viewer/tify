<template>
	<section class="tify-metadata">
		<h2 class="tify-sr-only">{{ 'Metadata'|trans }}</h2>

		<table class="tify-metadata_list">
			<tr class="tify-metadata_row" v-for="item in metadata">
				<th class="tify-metadata_label">{{ item.label|formatLabel|trans }}</th>
				<td class="tify-metadata_text" v-if="Array.isArray(item.value)">
					<template v-for="string, index in item.value">
						{{ string|trans }}<span v-if="index < item.value.length - 1">, </span>
					</template>
				</td>
				<td class="tify-metadata_text" v-else v-html="item.value"></td>
			</tr>
		</table>
	</section>
</template>

<script>
	export default {
		props: [
			'metadata',
		],
		filters: {
			formatLabel(value) {
				const cleanedValue = value.replace('_', ' ');
				return cleanedValue.charAt(0).toUpperCase() + cleanedValue.substr(1);
			},
		},
	};
</script>
