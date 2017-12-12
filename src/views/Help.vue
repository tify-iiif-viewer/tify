<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -doc">
			<h3>{{ 'Documentation'|trans }}</h3>
			<ul>
				<li>
					<a :href="`https://github.com/subugoe/tify/blob/v${env.VERSION}/doc/introduction.${lang}.md`">
						{{ 'Introduction'|trans }}
					</a>
				</li>
				<li>
					<a :href="`https://github.com/subugoe/tify/blob/v${env.VERSION}/doc/viewing-multiple-pages.${lang}.md`">
						{{ 'Viewing multiple pages'|trans }}
					</a>
				</li>
				<li>
					<a :href="`https://github.com/subugoe/tify/blob/v${env.VERSION}/doc/key-bindings.${lang}.md`">
						{{ 'Key bindings'|trans }}
					</a>
				</li>
			</ul>
		</div>

		<div class="tify-help_section -about">
			<h3>{{ 'About TIFY'|trans }}</h3>
			<p v-html="$root.$options.filters.trans('TIFY is a slim and mobile-friendly IIIF document viewer.')"/>
			<dl>
				<dt>{{ 'Version'|trans }}</dt>
				<dd>{{ env.VERSION }}</dd>
				<dt>{{ 'Author'|trans }}</dt>
				<dd><a :href="`mailto:${env.AUTHOR_EMAIL}`">{{env.AUTHOR_NAME}}</a></dd>
				<dt>{{ 'License'|trans }}</dt>
				<dd>{{ env.LICENSE }}</dd>
				<dt>{{ 'Source'|trans }}</dt>
				<dd><a :href="env.REPOSITORY_URL">GitHub</a></dd>
			</dl>
			<p v-if="env.BUGS_URL">
				{{ 'Found a bug?'|trans }}
				<a :href="env.BUGS_URL">{{ 'Please let us know.'|trans }}</a>
			</p>
			<p v-if="env.HOMEPAGE">
				<a :href="env.HOMEPAGE">{{ 'Visit the website'|trans }}</a>
			</p>
		</div>
	</section>
</template>

<script>
	export default {
		data() {
			return {
				env: process.env,
			};
		},
		computed: {
			lang() {
				return this.$root.options.language;
			},
		},
	};
</script>
