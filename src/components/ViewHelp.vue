<template>
	<section class="tify-help" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Help') }}</h2>

		<h3>{{ $root.translate('About TIFY') }}</h3>

		<p v-html="infoHtml"/>

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
			<p>
				{{ $root.translate('Version') }} <b>{{ env.VUE_APP_VERSION }}</b>
				&middot;
				<span v-html="copyrightHtml"/>
			</p>
		</footer>
	</section>
</template>

<script>
export default {
	computed: {
		copyrightHtml() {
			const copyright = 'Copyright &copy; 2017&ndash;2022'
					+ ' <a href="https://www.uni-goettingen.de/en/">Göttingen University</a>'
					+ '&nbsp;/ '
					+ '<a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>';
			return this.$root.translate('$copyright', copyright);
		},
		env() {
			return process.env;
		},
		infoHtml() {
			const info = 'TIFY is a slim and mobile-friendly IIIF document viewer, released under the'
				+ ' <a href="https://www.gnu.org/licenses/agpl-3.0.html.en">GNU Affero General Public License 3.0</a>.';
			return this.$root.translate('$info', info);
		},
		userGuideUrl() {
			const lang = process.env.VUE_APP_DOCS_LANGUAGES.split(',').includes(this.$root.options.language)
				? this.$root.options.language
				: 'en';
			return `${process.env.VUE_APP_DOCS_URL}/user-guide.${lang}.md`;
		},
	},
};
</script>
