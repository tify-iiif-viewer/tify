<script>
export default {
	data() {
		return {
			otherItems: [],
			perElementPdfLinksVisible: false,
		};
	},
	computed: {
		hasElementPdfLinks() {
			if (!(this.$store.manifest.structures instanceof Array)
				|| !this.$store.manifest.structures[0]
				|| !this.$store.manifest.structures[0].rendering
			) {
				return false;
			}

			const renderings = this.$store.manifest.structures[0].rendering;

			return renderings.some((rendering) => rendering.format && rendering.format === 'application/pdf');
		},
		imageUrls() {
			const imageUrls = {};

			this.$store.options.pages.forEach((page) => {
				if (!page) {
					return;
				}

				const resource = this.$store.manifest.items[page - 1].items?.[0]?.items?.[0]?.body;
				if (resource?.service) {
					const service = resource.service instanceof Array ? resource.service[0] : resource.service;
					const quality = ['ImageService2', 'ImageService3'].includes(service.type || service['@type'])
						? 'default'
						: 'native';
					const size = service.type === 'ImageService3'
						? 'max'
						: 'full';
					const id = service.id || service['@id'];
					imageUrls[page] = `${id}${id.at(-1) === '/' ? '' : '/'}full/${size}/0/${quality}.jpg`;
				} else {
					imageUrls[page] = resource?.id;
				}
			});

			return imageUrls;
		},
		pages() {
			return this.$store.options.pages.filter((page) => page > 0);
		},
		renderings() {
			return this.$store.manifest.rendering
				? [].concat(this.$store.manifest.rendering)
				: [];
		},
	},
};
</script>

<template>
	<section
		class="tify-export"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Export') }}
		</h2>

		<div
			v-if="$store.manifest"
			class="tify-export-section -links"
		>
			<h3>{{ $translate('Download Individual Images') }}</h3>
			<ul class="tify-export-image-list">
				<template v-for="page in pages">
					<li
						v-if="imageUrls[page]"
						:key="page"
					>
						<!-- NOTE: The download attribute is only honored for same-origin URLs -->
						<a
							class="tify-export-image-link"
							:href="imageUrls[page]"
							:download="`${page}.jpg`"
						>
							<img
								:src="$store.getThumbnailUrl(page, 96)"
								alt=""
							>
							{{ $translate('Page') }}
							{{ $store.getPageLabel(page, $store.manifest.items[page - 1].label) }}
						</a>
					</li>
				</template>
			</ul>
		</div>

		<div
			v-if="$store.manifest?.rendering"
			class="tify-export-section -renderings"
		>
			<h3>{{ $translate('Renderings') }}</h3>
			<ul class="tify-list">
				<li
					v-for="item in renderings"
					:key="item.id"
				>
					<a :href="item.id">{{ $store.localize(item.label) }}</a>
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
					:aria-controls="$getId('export-pdf-list')"
					:aria-expanded="perElementPdfLinksVisible"
					@click="perElementPdfLinksVisible = !perElementPdfLinksVisible"
				>
					<template v-if="!perElementPdfLinksVisible">
						{{ $translate('PDFs for each element') }}
					</template>
					<template v-else>
						<IconClose />
						<span class="tify-sr-only">{{ $translate('Close PDF list') }}</span>
					</template>
				</button>
				<div
					v-show="perElementPdfLinksVisible"
					:id="$getId('export-pdf-list')"
					class="tify-export-toc"
				>
					<h4>{{ $translate('PDFs for each element') }}</h4>
					<TocList
						ref="children"
						purpose="pdf"
						:level="0"
						:structures="$store.structures"
					/>
				</div>
			</div>
		</div>

		<div class="tify-export-section -iiif">
			<h3>IIIF</h3>
			<ul class="tify-list">
				<li v-if="$store.options.childManifestUrl">
					<a
						:href="$store.options.childManifestUrl"
						download="manifest.json"
					>
						{{ $translate('IIIF manifest (current document)') }}
					</a>
				</li>
				<li>
					<a
						:href="$store.options.manifestUrl"
						download="manifest.json"
					>
						{{ $translate($store.collection ? 'IIIF manifest (collection)' : 'IIIF manifest') }}
					</a>
				</li>
			</ul>
		</div>

		<div
			v-if="$store.manifest?.seeAlso?.length"
			class="tify-export-section -other"
		>
			<h3>{{ $translate('Other Formats') }}</h3>
			<ul class="tify-list">
				<li
					v-for="item in $store.manifest.seeAlso"
					:key="item.id"
				>
					<a
						:href="item.id"
						download
					>
						{{ item.label ? $store.localize(item.label) : item.id }}
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>
