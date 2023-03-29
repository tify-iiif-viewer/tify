<template>
	<section
		class="tify-export"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ translate('Export') }}
		</h2>

		<div class="tify-export-section -links">
			<h3>{{ translate('Download Individual Images') }}</h3>
			<ul>
				<li
					v-for="page in pages"
					:key="page"
				>
					<!-- NOTE: The download attribute is only honored for same-origin URLs -->
					<a
						:href="imageUrls[page]"
						:download="`${page}.jpg`"
					>
						{{ translate('Page') }}
						{{ getPageLabel(page, convertValueToArray(canvases[page - 1].label)[0]) }}
					</a>
				</li>
			</ul>
		</div>

		<div
			v-if="manifest.rendering"
			class="tify-export-section -renderings"
		>
			<h3>{{ translate('Renderings') }}</h3>
			<ul>
				<li
					v-for="item in renderings"
					:key="item['@id']"
				>
					<a :href="item['@id']">{{ item.label }}</a>
				</li>
			</ul>

			<div
				v-if="hasElementPdfLinks"
				class="tify-export-container"
			>
				<button
					type="button"
					class="tify-export-toggle"
					:class="{ '-close': perElementPdfLinksVisible }"
					:aria-controls="getId('export-pdf-list')"
					:aria-expanded="perElementPdfLinksVisible ? 'true' : 'false'"
					@click="perElementPdfLinksVisible = !perElementPdfLinksVisible"
				>
					<template v-if="!perElementPdfLinksVisible">
						{{ translate('PDFs for each element') }}
					</template>
					<template v-else>
						<icon-close />
						<span class="tify-sr-only">{{ translate('Close PDF list') }}</span>
					</template>
				</button>
				<div
					v-if="perElementPdfLinksVisible"
					:id="getId('export-pdf-list')"
					class="tify-export-toc"
				>
					<h4>{{ translate('PDFs for each element') }}</h4>
					<toc-list
						ref="children"
						purpose="pdf"
						:level="0"
						:structures="structures"
					/>
				</div>
			</div>
		</div>

		<div
			v-if="literatureItems.length"
			class="tify-export-section -literature"
		>
			<h3>{{ translate('Literature Management') }}</h3>
			<ul>
				<li
					v-for="item in literatureItems"
					:key="item['@id']"
				>
					<a
						:href="item['@id']"
						download
					>
						{{ item.label }}
					</a>
				</li>
			</ul>
		</div>

		<div class="tify-export-section -other">
			<h3>{{ translate('Other Formats') }}</h3>
			<ul>
				<li v-if="options.childManifestUrl">
					<a
						:href="options.childManifestUrl"
						download="manifest.json"
					>
						{{ translate('IIIF manifest (current document)') }}
					</a>
				</li>
				<li>
					<a
						:href="options.manifestUrl"
						download="manifest.json"
					>
						{{ translate(collection ? 'IIIF manifest (collection)' : 'IIIF manifest') }}
					</a>
				</li>
				<li
					v-for="item in otherItems"
					:key="item['@id']"
				>
					<a
						:href="item['@id']"
						download
					>
						{{ item.label || item['@id'] }}
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>

<script>
import { getId } from '../modules/id';
import { translate } from '../modules/i18n';
import { convertValueToArray, getPageLabel } from '../modules/iiif';
import { canvases, collection, manifest, options } from '../modules/store';
import { structures } from '../modules/structures';

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
			collection,
			literatureItems: [],
			manifest,
			options,
			otherItems: [],
			perElementPdfLinksVisible: false,
			structures,
		};
	},
	computed: {
		canvases() {
			return canvases.value;
		},
		pages() {
			return options.pages.filter((page) => page > 0);
		},
		hasElementPdfLinks() {
			if (!Array.isArray(manifest.structures)
				|| !manifest.structures[0]
				|| !manifest.structures[0].rendering
			) return false;

			const renderings = convertValueToArray(manifest.structures[0].rendering);
			return renderings.some((rendering) => rendering.format && rendering.format === 'application/pdf');
		},
		imageUrls() {
			const imageUrls = {};
			options.pages.forEach((page) => {
				if (!page) {
					return;
				}

				const { resource } = this.canvases[page - 1].images[0];
				if (resource.service) {
					const quality = resource.service['@context'] === 'http://iiif.io/api/image/2/context.json'
						? 'default'
						: 'native';
					const id = resource.service['@id'];
					imageUrls[page] = `${id}${id.slice(-1) === '/' ? '' : '/'}full/full/0/${quality}.jpg`;
				} else {
					imageUrls[page] = resource['@id'];
				}
			});
			return imageUrls;
		},
		renderings() {
			return convertValueToArray(manifest.rendering);
		},
	},
	created() {
		const { seeAlso } = manifest;
		if (!seeAlso) {
			return;
		}

		// Create clone
		const items = JSON.parse(JSON.stringify(Array.isArray(seeAlso) ? seeAlso : [seeAlso]));
		items.forEach((item) => {
			const currentItem = typeof item === 'object'
				? item
				: { '@id': item };
			let isLiterature = false;
			itemCriteria.some((criterion) => {
				const formatsMatch = item.format && criterion.format === item.format;
				const profilesMatch = item.profile && criterion.profile === item.profile;
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
	methods: {
		convertValueToArray,
		getId,
		getPageLabel,
		translate,
	},
};
</script>
