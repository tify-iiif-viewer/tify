<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -about">
			<h3>{{ 'About TIFY'|trans }}</h3>
			<p>TIFY is a slim and mobile-friendly IIIF document viewer,
				released under the GNU Affero General Public License 3.0.</p>
			<dl>
				<dt>{{ 'Version'|trans }}</dt>
				<dd>{{ info.VERSION }}</dd>
			</dl>
			<p>
				<a :href="info.DOCS_URL">{{ 'Open documentation'|trans }}</a>
			</p>
			<p>
				<a :href="info.REPOSITORY_URL">{{ 'Source code'|trans }}</a>
			</p>
			<p>
				<a :href="info.CONTRIBUTORS_URL">Contributors</a>
			</p>
			<p>
				Copyright © 2017-2020 <a href="https://www.uni-goettingen.de/en/">Göttingen University</a> /
				<a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>
			</p>
		</div>
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
