<script>
export default {
	computed: {
		// NOTE: If $t is returned directly, this text won’t update when the language is changed via API
		copyrightHtml() {
			return 'Copyright &copy; 2017&ndash;2022'
				+ ' <a href="https://www.uni-goettingen.de/en/">Göttingen University</a>'
				+ '&nbsp;/ '
				+ '<a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>';
		},
		env() {
			return ENV;
		},
		infoHtml() {
			return 'TIFY is a slim and mobile-friendly IIIF document viewer, released under the'
				+ ' <a href="https://www.gnu.org/licenses/agpl-3.0.html.en">GNU Affero General Public License 3.0</a>.';
		},
	},
};
</script>

<template>
	<section
		class="tify-help"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Help') }}
		</h2>

		<h3>{{ $translate('About TIFY') }}</h3>

		<p v-html="$translate('$info', infoHtml)" />

		<ul class="tify-list">
			<li>
				<a :href="env.repositoryUrl">{{ $translate('Source code') }}</a>
			</li>
			<li>
				<a :href="`${env.blobBaseUrl}/doc`">{{ $translate('Documentation') }}</a>
			</li>
			<li>
				<a :href="`${env.blobBaseUrl}/CONTRIBUTORS.md`">{{ $translate('Contributors') }}</a>
			</li>
			<li>
				<a :href="env.bugsUrl">{{ $translate('Report a bug') }}</a>
			</li>
		</ul>

		<footer class="tify-help-footer">
			<p>
				{{ $translate('Version') }} <b>{{ env.version }}</b>
				&middot;
				<span v-html="$translate('$copyright', copyrightHtml)" />
			</p>
		</footer>
	</section>
</template>
