<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Export'|trans }}</h2>

		<template v-if="renderingItems">
			<h3>{{ 'Renderings'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in renderingItems">
					<a :href="item['@id']" download>{{ item.label|trans }}</a>
				</li>
			</ul>
		</template>

		<template v-if="literatureItems">
			<h3>{{ 'Literature Management'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in literatureItems">
					<a :href="item['@id']" download>{{ item.label }}</a>
				</li>
			</ul>
		</template>

		<template v-if="otherItems">
			<h3>{{ 'Other Formats'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in otherItems">
					<a :href="item['@id']" download>{{ item.label }}</a>
				</li>
			</ul>
		</template>
	</section>
</template>

<script>
	export default {
		name: 'PanelExport',
		props: [
			'exportItems',
			'renderingItems',
		],
		data() {
			return {
				criteria: [
					{
						label: 'BibTex',
						profile: 'http://www.bibtex.org/Format/',
						type: 'literature',
					},
					{
						label: 'EndNote',
						profile: 'http://endnote.com/',
						type: 'literature',
					},
					{
						label: 'RIS',
						profile: 'http://referencemanager.com/sites/rm/files/m/direct_export_ris.pdf',
						type: 'literature',
					},
					{
						label: 'METS',
						profile: 'http://www.loc.gov/standards/mets/profile_docs/mets.profile.v2-0.xsd',
						type: 'other',
					},
					{
						label: 'MODS',
						format: 'application/mods+xml',
						type: 'other',
					},
				],
			};
		},
		computed: {
			literatureItems() {
				return this.filterExportItems('literature');
			},
			otherItems() {
				return this.filterExportItems('other');
			},
		},
		methods: {
			filterExportItems(type) {
				const exportItems = Array.isArray(this.exportItems) ? this.exportItems : [this.exportItems];
				const filteredItems = [];
				exportItems.forEach((item) => {
					this.criteria.some((criterion) => {
						const formatsMatch = (criterion.format === item.format);
						const profilesMatch = (criterion.profile === item.profile);
						if (criterion.type === type && (formatsMatch || profilesMatch)) {
							const exportItem = item;
							exportItem.label = criterion.label;
							return filteredItems.push(exportItem);
						}
						return false;
					});
				});
				if (filteredItems.length < 1) return null;
				return filteredItems;
			},
		},
	};
</script>
