<template>
	<section class="tify-metadata">
		<h2 class="tify-sr-only">{{ 'Metadata'|trans }}</h2>

		<table class="tify-metadata_list">
			<tr class="tify-metadata_row" v-for="item in metadata">
				<th class="tify-metadata_label">{{ item.label|formatLabel|trans }}</th>
				<td v-if="Array.isArray(item.value)" class="tify-metadata_text">
					<div v-for="value, index in item.value" v-html="$root.$options.filters.trans(filterHtml(value))"></div>
				</td>
				<td v-else v-html="$root.$options.filters.trans(filterHtml(item.value))" class="tify-metadata_text"></td>
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
				const allowedTags = ['a', 'b', 'br', 'i', 'img', 'p'];
				const allowedAttributes = { a: ['href'], img: ['alt', 'src'] };

				// TODO: '<' and '>' inside attribute values should not be removed.
				// This is a bug within striptags.
				let filteredHtml = striptags(html, allowedTags);

				// Iterate over all opening (including self-closing) HTML tags
				const htmlTagsRegex = /<(\w+)((\s+[\w]+(\s*=\s*(?:".*?"|'.*?'|.*?|[\^'">\s]+))?)+\s*|\s*)>/g;
				filteredHtml = filteredHtml.replace(htmlTagsRegex, (match, tag, attributes) => {
					if (!attributes) return `<${tag}>`;

					// Iterate over all attibutes and keep only allowed ones
					const attributesRegex = /(?:([^\s]+)="(.*?)"|'(.*?)')|([^\s]+)/g;
					const keptAttributes = [];
					attributes.replace(attributesRegex, (tuple, key) => {
						if (tuple !== key && allowedAttributes[tag] && allowedAttributes[tag].indexOf(key) > -1) {
							keptAttributes.push(tuple);
						}
					});

					return (keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`);
				});

				return filteredHtml;
			},
		},
	};
</script>
