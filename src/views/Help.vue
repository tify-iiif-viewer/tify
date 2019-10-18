<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -doc">
			<h3>{{ 'Documentation'|trans }}</h3>
			<p><a :href="info.DOCS_URL">Open documentation</a></p>
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
		},
	};
</script>
