<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -about">
			<h3>{{ 'About TIFY'|trans }}</h3>
			<p v-html="$root.$options.filters.trans('TIFY is a slim and mobile-friendly IIIF document viewer.')"/>
			<dl>
				<dt>{{ 'Version'|trans }}</dt>
				<dd>{{ info.VERSION }}</dd>
			</dl>
		</div>
		<div class="tify-help_section -doc">
			<p><a :href="info.DOCS_URL" target="_blank">{{ 'Documentation'|trans }}</a></p>
			<p><a :href="info.REPOSITORY_URL" target="_blank">{{ 'Source code'|trans }}</a></p>
			<p><a :href="info.BUGS_URL" target="_blank">{{ 'Report a bug'|trans }}</a></p>
		</div>
		<br>
		<p><a :href="info.CONTRIBUTORS" target="_blank">{{ 'Contributors'|trans }}</a></p>
		<br>
		<p>
			Copyright (c) 2017-2020 Göttingen University - Göttingen State and University Library<br>
			Licensed under GNU Affero General Public License v3.0
		</p>
		<br>
		<p><a href="https://uni-goettingen.de">uni-goettingen.de</a></p>
		<p><a href="https://sub.uni-goettingen.de">sub.uni-goettingen.de</a></p>
		<p><a href="https://aspectis.net">aspectis.net</a></p>
	</section>
</template>

<script>
export default {
	computed: {
		info() {
			return JSON.parse(unescape(process.env.VUE_APP_INFO));
		},
	},
};
</script>
