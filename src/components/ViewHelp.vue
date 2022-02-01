<template>
	<section class="tify-help" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Help') }}</h2>

		<h3>{{ $root.translate('About TIFY') }}</h3>

		<p v-html="info"/>

		<ul>
			<li>
				<a :href="userGuideUrl">{{ $root.translate('User guide') }}</a>
			</li>
			<li>
				<a :href="env.VUE_APP_REPOSITORY_URL">{{ $root.translate('Source code') }}</a>
			</li>
			<li>
				<a :href="env.VUE_APP_CONTRIBUTORS_URL">{{ $root.translate('Contributors') }}</a>
			</li>
			<li>
				<a :href="env.VUE_APP_BUGS_URL">{{ $root.translate('Report a bug') }}</a>
			</li>
		</ul>

		<footer class="tify-help-footer">
			<p>{{ $root.translate('Version') }} {{ env.VUE_APP_VERSION }}</p>
			<p v-html="copyright"/>
		</footer>
	</section>
</template>

<script>
export default {
	computed: {
		copyright() {
			const copyright = 'Copyright &copy; 2017&ndash;2022'
					+ ' <a href="https://www.uni-goettingen.de/en/">Göttingen University</a>'
					+ ' / <a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>';
			return this.$root.translate('$copyright', copyright);
		},
		env() {
			return process.env;
		},
		info() {
			const info = 'TIFY is a slim and mobile-friendly IIIF document viewer'
				+ ', released under the GNU Affero General Public License 3.0.';
			return this.$root.translate('$info', info);
		},
		userGuideUrl() {
			// NOTE: VUE_APP_DOCS_LANGUAGES is not an array but a string ("de,en"), yet still works as intended here
			const lang = process.env.VUE_APP_DOCS_LANGUAGES.includes(this.$root.options.language)
				? this.$root.options.language
				: 'en';
			return `${process.env.VUE_APP_DOCS_URL}/user-guide.${lang}.md`;
		},
	},
};
</script>
