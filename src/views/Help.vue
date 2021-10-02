<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ $root.translate('Help') }}</h2>

		<div class="tify-help_section -about">
			<h3>{{ $root.translate('About TIFY') }}</h3>
			<p>
				{{ $root.translate(info) }}
			</p>
			<p>
				{{ $root.translate('Version') }} {{ env.VUE_APP_VERSION }}
			</p>
			<ul>
				<li>
					<a :href="env.VUE_APP_DOCS_URL">{{ $root.translate('Documentation') }}</a>
				</li>
				<li>
					<a :href="env.VUE_APP_REPOSITORY_URL">{{ $root.translate('Source code') }}</a>
				</li>
				<li>
					<a :href="env.VUE_APP_CONTRIBUTORS_URL">{{ $root.translate('Contributors') }}</a>
				</li>
			</ul>
			<p>
				<a :href="env.VUE_APP_BUGS_URL">{{ $root.translate('Report a bug') }}</a>
			</p>
			<p v-html="$root.translate(copyright)"/>
		</div>
	</section>
</template>

<script>
export default {
	computed: {
		copyright() {
			return this.$root.language === 'en'
				? 'Copyright &copy; 2017&ndash;2021'
					+ ' <a href="https://www.uni-goettingen.de/en/">Göttingen University</a>'
					+ ' / <a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>'
				: '$copyright';
		},
		env() {
			return process.env;
		},
		info() {
			return this.$root.language === 'en'
				? 'TIFY is a slim and mobile-friendly IIIF document viewer'
					+ ', released under the GNU Affero General Public License 3.0.'
				: '$info';
		},
	},
};
</script>
