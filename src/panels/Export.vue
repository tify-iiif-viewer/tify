<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Export'|trans }}</h2>

		<template v-if="literatureItems">
			<h3>{{ 'Literature Management'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in literatureItems">
					<a :href="item['@id']" download>{{ item.name }}</a>
				</li>
			</ul>
		</template>

		<template v-if="metadataItems">
			<h3>{{ 'Metadata'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in metadataItems">
					<a :href="item['@id']" download>{{ item.name }}</a>
				</li>
			</ul>
		</template>
	</section>
</template>

<script>
	export default {
		name: 'PanelExport',
		props: [
			'items',
		],
		data() {
			return {
				criteria: [
					{
						name: 'BibTex',
						profile: 'http://www.bibtex.org/Format/',
						type: 'literature',
					},
					{
						name: 'EndNote',
						profile: 'http://endnote.com/',
						type: 'literature',
					},
					{
						name: 'RIS',
						profile: 'http://referencemanager.com/sites/rm/files/m/direct_export_ris.pdf',
						type: 'literature',
					},
					{
						name: 'METS',
						profile: 'http://www.loc.gov/standards/mets/profile_docs/mets.profile.v2-0.xsd',
						type: 'metadata',
					},
				],
			};
		},
		computed: {
			literatureItems() {
				return this.filterItems('literature');
			},
			metadataItems() {
				return this.filterItems('metadata');
			},
		},
		methods: {
			filterItems(type) {
				const filteredItems = [];
				this.items.forEach((item) => {
					this.criteria.some((criterion) => {
						if (criterion.type === type && criterion.profile === item.profile) {
							const exportItem = item;
							exportItem.name = criterion.name;
							return filteredItems.push(exportItem);
						}
						return false;
					});
				});
				return filteredItems;
			},
		},
	};
</script>
