<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Export'|trans }}</h2>

		<template v-if="$root.manifest.rendering">
			<h3>{{ 'Renderings'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in $root.manifest.rendering">
					<a :href="item['@id']">{{ item.label|trans }}</a>
				</li>
			</ul>
		</template>

		<template v-if="literatureItems.length">
			<h3>{{ 'Literature Management'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in literatureItems">
					<a :href="item['@id']" download>{{ item.label }}</a>
				</li>
			</ul>
		</template>

		<template v-if="otherItems.length">
			<h3>{{ 'Other Formats'|trans }}</h3>
			<ul class="tify-export_links">
				<li v-for="item in otherItems">
					<a :href="item['@id']" download>{{ item.label || item['@id'] }}</a>
				</li>
			</ul>
		</template>
	</section>
</template>

<script>
	const itemCriteria = [
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
	];

	export default {
		data() {
			return {
				literatureItems: [],
				otherItems: [],
			};
		},
		created() {
			const seeAlso = this.$root.manifest.seeAlso;
			// Create clone
			const items = JSON.parse(JSON.stringify(Array.isArray(seeAlso) ? seeAlso : [seeAlso]));
			items.forEach((item) => {
				const currentItem = item;
				let isLiterature = false;
				itemCriteria.some((criterion) => {
					const formatsMatch = (criterion.format === item.format);
					const profilesMatch = (criterion.profile === item.profile);
					if (formatsMatch || profilesMatch) {
						currentItem.label = criterion.label;
						if (criterion.type === 'literature') isLiterature = true;
						return true;
					}
					return false;
				});

				if (isLiterature) {
					this.literatureItems.push(currentItem);
				} else {
					this.otherItems.push(currentItem);
				}
			});
		},
	};
</script>
