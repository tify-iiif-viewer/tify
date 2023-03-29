<template>
	<section
		class="tify-help"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ translate('Help') }}
		</h2>

		<h3>{{ translate('About TIFY') }}</h3>

		<p v-html="infoHtml" />

		<ul>
			<li>
				<a :href="userGuideUrl">{{ translate('User guide') }}</a>
			</li>
			<li>
				<a :href="env.repositoryUrl">{{ translate('Source code') }}</a>
			</li>
			<li>
				<a :href="env.contributorsUrl">{{ translate('Contributors') }}</a>
			</li>
			<li>
				<a :href="env.bugsUrl">{{ translate('Report a bug') }}</a>
			</li>
		</ul>

		<footer class="tify-help-footer">
			<p>
				{{ translate('Version') }} <b>{{ env.version }}</b>
				&middot;
				<span v-html="copyrightHtml" />
			</p>
		</footer>
	</section>
</template>

<script>
import { translate } from '../modules/i18n';
import { options } from '../modules/store';

export default {
	computed: {
		copyrightHtml() {
			const copyright = 'Copyright &copy; 2017&ndash;2022'
				+ ' <a href="https://www.uni-goettingen.de/en/">Göttingen University</a>'
				+ '&nbsp;/ '
				+ '<a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>';
			return translate('$copyright', copyright);
		},
		env() {
			return ENV;
		},
		infoHtml() {
			const info = 'TIFY is a slim and mobile-friendly IIIF document viewer, released under the'
				+ ' <a href="https://www.gnu.org/licenses/agpl-3.0.html.en">GNU Affero General Public License 3.0</a>.';
			return translate('$info', info);
		},
		userGuideUrl() {
			const lang = this.env.docsLanguages.includes(options.language)
				? options.language
				: 'en';
			return `${this.env.docsUrl}/user-guide.${lang}.md`;
		},
	},
	methods: {
		translate,
	},
};
</script>
