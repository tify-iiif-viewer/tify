<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Export'|trans }}</h2>

		<div class="tify-export_section -links">
			<h3>{{ 'Download Individual Images'|trans }}</h3>
			<ul>
				<li :key="page" v-for="page in pages">
					<!-- NOTE: The download attribute is only honored for same-origin URLs -->
					<a :href="imageUrls[page]" :download="`${page}.${root.options.tileFormat}`">
						{{ 'Page'|trans }} {{page}} : {{ getLabels($root.canvases[page - 1].label)[0] }}
					</a>
				</li>
			</ul>
		</div>

		<div v-if="$root.manifest.rendering" class="tify-export_section -renderings">
			<h3>{{ 'Renderings'|trans }}</h3>
			<ul>
				<li :key="item['@id']" v-for="item in $root.manifest.rendering">
					<template v-if="/\.pdf$/i.test(item['@id'])">
						<i class="tify-badge" v-if="/\.pdf$/i.test(item['@id'])">PDF</i>
						<a :href="item['@id']" download>{{ item.label }}</a>
					</template>
					<template v-else>
						<a :href="item['@id']">{{ item.label }}</a>
					</template>
				</li>
			</ul>

			<div class="tify-export_container" v-if="hasElementPdfLinks">
				<button
						class="tify-export_toggle"
						@click="perElementPdfLinksVisible = !perElementPdfLinksVisible"
				>
					<template v-if="!perElementPdfLinksVisible">{{ 'PDFs for each element'|trans }}</template>
					<template v-else>{{ 'Close PDF list'|trans }}</template>
				</button>
				<div class="tify-export_toc" v-show="perElementPdfLinksVisible">
					<toc-list
						purpose="pdf"
						ref="children"
						:level="0"
						:structures="structures"
					/>
				</div>
			</div>
		</div>

		<div v-if="literatureItems.length" class="tify-export_section -literature">
			<h3>{{ 'Literature Management'|trans }}</h3>
			<ul>
				<li :key="item['@id']" v-for="item in literatureItems">
					<a :href="item['@id']" download>
						{{ item.label }}
					</a>
				</li>
			</ul>
		</div>

		<div class="tify-export_section -other">
			<h3>{{ 'Other Formats'|trans }}</h3>
			<ul>
				<li>
					<a :href="$root.manifestUrl" download="manifest.json">
						{{ 'IIIF manifest'|trans }}
					</a>
				</li>
				<li :key="item['@id']" v-for="item in otherItems">
					<a :href="item['@id']" download>
						{{ item.label || item['@id'] }}
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>

<script>
import TocList from '@/components/TocList';

import structures from '@/mixins/structures';

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
	components: {
		TocList,
	},
	mixins: [
		structures,
	],
	data() {
		return {
			literatureItems: [],
			otherItems: [],
			perElementPdfLinksVisible: false,
		};
	},
	methods: {
		getLabels(value) {
			return this.$root.convertValueToArray(value);
		},
	},
	computed: {
		pages() {
			return this.$root.params.pages.filter((page) => page > 0);
		},
		hasElementPdfLinks() {
			const { manifest } = this.$root;

			if (
				!Array.isArray(manifest.structures)
					|| !manifest.structures[0]
					|| !manifest.structures[0].rendering
			) return false;

			const renderings = this.$root.convertValueToArray(manifest.structures[0].rendering);
			return renderings.some((rendering) => rendering.format && rendering.format === 'application/pdf');
		},
		imageUrls() {
			const { params, options } = this.$root;
			const imageUrls = {};
			params.pages.forEach((page) => {
				if (!page) return;

				const { resource } = this.$root.canvases[page - 1].images[0];
				if (resource.service) {
					const quality = (
						resource.service['@context'] === 'http://iiif.io/api/image/2/context.json'
							? 'default'
							: 'native'
					);
					const id = resource.service['@id'];
					const sep = id.slice(-1) === '/' ? '' : '/';
					imageUrls[page] = `${id}${sep}full/full/0/${quality}.${options.tileFormat}`;
				} else {
					imageUrls[page] = resource['@id'];
				}
			});
			return imageUrls;
		},
	},
	created() {
		const { seeAlso } = this.$root.manifest;
		if (!seeAlso) return;

		// Create clone
		const items = JSON.parse(JSON.stringify(Array.isArray(seeAlso) ? seeAlso : [seeAlso]));
		items.forEach((item) => {
			const currentItem = (typeof item === 'object' ? item : { '@id': item });
			let isLiterature = false;
			itemCriteria.some((criterion) => {
				const formatsMatch = (item.format && criterion.format === item.format);
				const profilesMatch = (item.profile && criterion.profile === item.profile);
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
