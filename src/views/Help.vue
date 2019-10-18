<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -doc">
			<h3>{{ 'Documentation'|trans }}</h3>
			<ul>
				<li>
					<a :href="`${info.DOCS_URL}/introduction.${lang}.md`">
						{{ 'Introduction'|trans }}
					</a>
				</li>
				<li>
					<a :href="`${info.DOCS_URL}/viewing-multiple-pages.${lang}.md`">
						{{ 'Viewing multiple pages'|trans }}
					</a>
				</li>
				<li>
					<a :href="`${info.DOCS_URL}/key-bindings.${lang}.md`">
						{{ 'Key bindings'|trans }}
					</a>
				</li>
			</ul>
		</div>

		<div class="tify-help_section -about">
			<h3>{{ 'About TIFY'|trans }}</h3>
			<p v-html="$root.$options.filters.trans('TIFY is a slim and mobile-friendly IIIF document viewer.')"/>
			<dl>
				<dt>{{ 'Author'|trans }}</dt>
				<dd><a :href="info.AUTHOR.url">{{info.AUTHOR.name}}</a></dd>
				<dt>{{ 'Version'|trans }}</dt>
				<dd>{{ info.VERSION }}</dd>
				<dt>{{ 'License'|trans }}</dt>
				<dd>{{ info.LICENSE }}</dd>
			</dl>
			<p>
				<a :href="info.REPOSITORY_URL">{{ 'Source code'|trans }}</a>
			</p>
			<p>
				<a :href="info.BUGS_URL">{{ 'Report a bug'|trans }}</a>
			</p>
		</div>
	</section>
</template>

<script>
	export default {
		computed: {
			info() {
				return JSON.parse(unescape(process.env.INFO));
			},
			lang() {
				return this.$root.options.language;
			},
		},
	};
</script>
