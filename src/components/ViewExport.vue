<template>
	<section class="tify-export" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Export') }}</h2>

		<div class="tify-export-section -links">
			<h3>{{ $root.translate('Download Individual Images') }}</h3>
			<ul>
				<li :key="page" v-for="page in pages">
					<!-- NOTE: The download attribute is only honored for same-origin URLs -->
					<a :href="imageUrls[page]" :download="`${page}.jpg`">
						{{ $root.translate('Page') }}
						{{ $root.getPageLabel(page, $root.convertValueToArray($root.canvases[page - 1].label)[0]) }}
					</a>
				</li>
			</ul>
		</div>

		<div v-if="this.$root.manifest.rendering" class="tify-export-section -renderings">
			<h3>{{ $root.translate('Renderings') }}</h3>
			<ul>
				<li :key="item['@id']" v-for="item in renderings">
					<a :href="item['@id']">{{ item.label }}</a>
				</li>
			</ul>

			<div class="tify-export-container" v-if="hasElementPdfLinks">
				<button
					class="tify-export-toggle"
					:class="{ '-close': perElementPdfLinksVisible }"
					:aria-controls="$root.getId('export-pdf-list')"
					:aria-expanded="perElementPdfLinksVisible ? 'true' : 'false'"
					@click="perElementPdfLinksVisible = !perElementPdfLinksVisible"
				>
					<template v-if="!perElementPdfLinksVisible">
						{{ $root.translate('PDFs for each element') }}
					</template>
					<template v-else>
						<icon-close/>
						<span class="tify-sr-only">{{ $root.translate('Close PDF list') }}</span>
					</template>
				</button>
				<div
					class="tify-export-toc"
					:id="$root.getId('export-pdf-list')"
					v-if="perElementPdfLinksVisible"
				>
					<h4>{{ $root.translate('PDFs for each element') }}</h4>
					<toc-list
						purpose="pdf"
						ref="children"
						:level="0"
						:structures="structures"
					/>
				</div>
			</div>
		</div>

		<div v-if="literatureItems.length" class="tify-export-section -literature">
			<h3>{{ $root.translate('Literature Management') }}</h3>
			<ul>
				<li :key="item['@id']" v-for="item in literatureItems">
					<a :href="item['@id']" download>
						{{ item.label }}
					</a>
				</li>
			</ul>
		</div>

		<div class="tify-export-section -other">
			<h3>{{ $root.translate('Other Formats') }}</h3>
			<ul>
				<li>
					<a :href="$root.options.manifestUrl" download="manifest.json">
						{{ $root.translate('IIIF manifest') }}
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
import TocList from './TocList';

import structures from '../mixins/structures';

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
	computed: {
		pages() {
			return this.$root.options.pages.filter((page) => page > 0);
		},
		hasElementPdfLinks() {
			const { manifest } = this.$root;

			if (!Array.isArray(manifest.structures)
				|| !manifest.structures[0]
				|| !manifest.structures[0].rendering
			) return false;

			const renderings = this.$root.convertValueToArray(manifest.structures[0].rendering);
			return renderings.some((rendering) => rendering.format && rendering.format === 'application/pdf');
		},
		imageUrls() {
			const imageUrls = {};
			this.$root.options.pages.forEach((page) => {
				if (!page) {
					return;
				}

				const { resource } = this.$root.canvases[page - 1].images[0];
				if (resource.service) {
					const quality = (
						resource.service['@context'] === 'http://iiif.io/api/image/2/context.json'
							? 'default'
							: 'native'
					);
					const id = resource.service['@id'];
					imageUrls[page] = `${id}${id.slice(-1) === '/' ? '' : '/'}full/full/0/${quality}.jpg`;
				} else {
					imageUrls[page] = resource['@id'];
				}
			});
			return imageUrls;
		},
		renderings() {
			return this.$root.convertValueToArray(this.$root.manifest.rendering);
		},
	},
	created() {
		const { seeAlso } = this.$root.manifest;
		if (!seeAlso) {
			return;
		}

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
					if (criterion.type === 'literature') {
						isLiterature = true;
					}

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
