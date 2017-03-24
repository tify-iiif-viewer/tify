<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Export'|trans }}</h2>

		<h3>PDF</h3>
		<p v-if="pdfSizeMb > 0">
			<a :href="href">
				<i class="tify-icon">file_download</i>
				{{ 'Download as PDF'|trans }}
			</a>
			({{ pdfSizeMb }}&nbsp;MB)
		</p>
		<p v-else>
			{{ 'PDF not yet available'|trans }}
		</p>

		<hr>

		<h3>{{ 'Literature management'|trans }}</h3>
		<ul class="tify-export_links">
			<li v-if="bibUrl">
				<a :href="bibUrl" download>
					<i class="tify-icon">file_download</i>
					{{ 'export.BibTeX'|trans }}
				</a>
			</li>
			<li v-if="risUrl">
				<a :href="risUrl" download>
					<i class="tify-icon">file_download</i>
					{{ 'export.RIS'|trans }}
				</a>
			</li>
			<li v-if="endnoteUrl">
				<a :href="endnoteUrl" download>
					<i class="tify-icon">file_download</i>
					{{ 'export.Endnote'|trans }}
				</a>
			</li>
		</ul>

		<hr>

		<ul class="tify-export_links">
			<li v-if="metsUrl">
				<a :href="metsUrl" download>
					<i class="tify-icon">code</i>
					{{ 'Metadata as METS file'|trans }}
				</a>
			</li>
		</ul>
	</section>
</template>

<script>
	export default {
		name: 'PanelExport',
		props: [
			'manifest',
		],
		data() {
			return {
				pdfSizeMb: -1,
				bibUrl: '',
				risUrl: '',
				endnoteUrl: '',
				metsUrl: '',
			};
		},
	};
</script>
