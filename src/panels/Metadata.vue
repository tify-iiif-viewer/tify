<template>
	<section class="tify-metadata">
		<h2 class="tify-sr-only">{{ 'Metadata'|trans }}</h2>

		<table class="tify-metadata_list">
			<tr class="tify-metadata_row" v-for="item in metadata">
				<th class="tify-metadata_label">{{ item.label|trans }}</th>
				<td class="tify-metadata_text" v-if="Array.isArray(item.value)">
					<template v-for="string, index in item.value">
						{{ string|trans }}<span v-if="index < item.value.length - 1">, </span>
					</template>
				</td>
				<td class="tify-metadata_text" v-else>
					{{ item.value|trans }}
				</td>
			</tr>
		</table>
	</section>
</template>

<script>
	export default {
		props: [
			'metadata',
		],
	};
</script>
