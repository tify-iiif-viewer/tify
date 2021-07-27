<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -about">
			<h3>{{ 'About TIFY'|trans }}</h3>
			<p>
				TIFY is a slim and mobile-friendly IIIF document viewer,
				released under the GNU Affero General Public License 3.0.
			</p>
			<p>
				Version {{ env.VUE_APP_VERSION }}
			</p>
			<ul>
				<li>
					<a :href="env.VUE_APP_DOCS_URL">Documentation</a>
				</li>
				<li>
					<a :href="env.VUE_APP_REPOSITORY_URL">Source code</a>
				</li>
				<li>
					<a :href="env.VUE_APP_CONTRIBUTORS_URL">Contributors</a>
				</li>
			</ul>
			<p>
				<a :href="env.VUE_APP_BUGS_URL">Report a bug</a>
			</p>
			<p>
				Copyright &copy; 2017&ndash;2021
				<a href="https://www.uni-goettingen.de/en/">Göttingen University</a>
				/
				<a href="https://www.sub.uni-goettingen.de/en/">Göttingen State and University Library</a>
			</p>
		</div>
	</section>
</template>

<script>
export default {
	computed: {
		env() {
			return process.env;
		},
	},
};
</script>
