<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Export'|trans }}</h2>

		<h3>{{ 'Literature management'|trans }}</h3>
		<ul class="tify-export_links">
			<li v-for="item in items">
				<a :href="item['@id']" download>
					<span v-if="item.format === 'application/x-bibtex'">
						{{ 'BibTeX'|trans }}
					</span>
					<span v-else-if="item.format === 'application/x-research-info-systems'">
						{{ 'RIS'|trans }}
					</span>
					<span v-else-if="item.format === 'application/x-endnote-refer'">
						{{ 'EndNote'|trans }}
					</span>
				</a>
			</li>
		</ul>
	</section>
</template>

<script>
	export default {
		name: 'PanelExport',
		props: [
			'items',
		],
	};
</script>
