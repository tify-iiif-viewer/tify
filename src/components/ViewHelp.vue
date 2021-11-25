<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ $root.translate('Help') }}</h2>
		<h3>{{ $root.translate('About TIFY') }}</h3>
		<p v-html="info"/>
		<ul>
			<li>
				<a :href="env.VUE_APP_DOCS_URL">{{ $root.translate('User guide') }}</a>
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
		<footer class="tify-help_footer">
			<p>{{ $root.translate('Version') }} {{ env.VUE_APP_VERSION }}</p>
			<p v-html="copyright"/>
		</footer>
	</section>
</template>

<script>
export default {
	computed: {
		copyright() {
			const copyright = 'Copyright &copy; 2017&ndash;2021'
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
	},
};
</script>
