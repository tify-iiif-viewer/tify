<script>
export default {
	computed: {
		env: () => ENV,
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

		<!-- eslint-disable-next-line vue/max-len -->
		<p v-html="$translate('$info', `TIFY is a slim and mobile-friendly IIIF document viewer, released under the <a href='https://www.gnu.org/licenses/agpl-3.0.html.en'>GNU Affero General Public License 3.0</a>.`)" />

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
				<!-- eslint-disable-next-line vue/max-len -->
				<span v-html="$translate('$copyright', `Copyright &copy; 2017&ndash;2025 <a href='https://www.uni-goettingen.de/en/'>Göttingen University</a>&nbsp;/ <a href='https://www.sub.uni-goettingen.de/en/'>Göttingen State and University Library</a>`)" />
			</p>
		</footer>
	</section>
</template>
