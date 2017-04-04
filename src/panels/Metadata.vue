<template>
	<section class="tify-metadata">
		<h2 class="tify-sr-only">{{ 'Metadata'|trans }}</h2>

		<table class="tify-metadata_list">
			<tr class="tify-metadata_row" v-for="item in metadata">
				<th class="tify-metadata_label">{{ item.label|formatLabel|trans }}</th>
				<td v-if="Array.isArray(item.value)" class="tify-metadata_text">
					<div v-for="value, index in item.value" v-html="filterHtml(value)"></div>
				</td>
				<td v-else v-html="filterHtml(item.value)" class="tify-metadata_text"></td>
			</tr>
		</table>
	</section>
</template>

<script>
	import striptags from 'striptags';

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
		methods: {
			filterHtml(html) {
				// See http://iiif.io/api/presentation/2.1/#html-markup-in-property-values
				// TODO: '<' and '>' inside attribute values should not be removed.
				// This is a bug within striptags.
				let filteredHtml = striptags(html, ['a', 'b', 'br', 'i', 'img', 'p']);

				// Iterate over all opening (including self-closing) HTML tags
				const htmlTagsRegex = /<(\w+)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)>/g;
				filteredHtml = filteredHtml.replace(htmlTagsRegex, (match, tag, attributes) => {
					if (!attributes) return `<${tag}>`;

					// Iterate over all attibutes and keep only allowed ones
					const attributesRegex = /([^\s]+)="(.*?)"|'(.*?)'/g;
					const keptAttributes = [];
					attributes.replace(attributesRegex, (tuple, key) => {
						const isGoodA = (tag === 'a' && key === 'href');
						const isGoodImg = (tag === 'img' && (key === 'alt' || key === 'src'));
						if (isGoodA || isGoodImg) keptAttributes.push(tuple);
					});

					return (keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`);
				});

				return this.$root.$options.filters.trans(filteredHtml);
			},
		},
	};
</script>
