<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -keys">
			<h3>{{ 'Key Bindings'|trans }}</h3>

			<h4>{{ 'View'|trans }}</h4>
			<dl>
				<dt>
					{{ 'Fulltext'|trans }}
					<small v-html="$options.filters.trans('(if&nbsp;available)')"/>
				</dt>
				<dd>
					<code>{{ '1' }}</code>
				</dd>
				<dt>
					{{ 'Pages'|trans }}
				</dt>
				<dd>
					<code>{{ '2' }}</code>
				</dd>
				<dt>
					{{ 'Contents'|trans }}
					<small v-html="$options.filters.trans('(if&nbsp;available)')"/>
				</dt>
				<dd>
					<code>{{ '3' }}</code>
				</dd>
				<dt>
					{{ 'Info'|trans }}
				</dt>
				<dd>
					<code>{{ '4' }}</code>
				</dd>
				<dt>
					{{ 'Export'|trans }}
				</dt>
				<dd>
					<code>{{ '5' }}</code>
				</dd>
				<dt>
					{{ 'Help'|trans }}
				</dt>
				<dd>
					<code>{{ '6' }}</code>
				</dd>
				<dt>
					{{ 'Scan'|trans }}
				</dt>
				<dd>
					<code>{{ 'Backspace'|trans }}</code>
				</dd>
			</dl>

			<h4>{{ 'Turning Pages'|trans }}</h4>
			<dl>
				<dt>
					{{ 'Previous page'|trans }}
				</dt>
				<dd>
					<code>Q</code>
					{{ 'or'|trans }}
					<code>,</code>
				</dd>
				<dt>
					{{ 'Next page'|trans }}
				</dt>
				<dd>
					<code>E</code>
					{{ 'or'|trans }}
					<code>.</code>
				</dd>
				<dt>
					{{ 'First page'|trans }}
				</dt>
				<dd>
					<code>&#8679;</code> + <code>Q</code>
				</dd>
				<dt>
					{{ 'Last page'|trans }}
				</dt>
				<dd>
					<code>&#8679;</code> + <code>E</code>
				</dd>
				<dt>
					{{ 'Jump to page'|trans }}
				</dt>
				<dd>
					<code>X</code>
				</dd>
				<dt>
					{{ 'Toggle double-page'|trans }}
				</dt>
				<dd>
					<code>B</code>
				</dd>
			</dl>

			<h4>{{ 'Scan' }}</h4>
			<dl>
				<dt>
					{{ 'Zoom in'|trans }}
				</dt>
				<dd>
					<code>&#8679;</code> + <code>W</code>
					{{ 'or'|trans }}
					<code>+</code>
				</dd>
				<dt>
					{{ 'Zoom out'|trans }}
				</dt>
				<dd>
					<code>&#8679;</code> + <code>S</code>
					{{ 'or'|trans }}
					<code>-</code>
				</dd>
				<dt>
					{{ 'Pan'|trans }}
				</dt>
				<dd>
					<code>W</code> <code>S</code> <code>A</code> <code>D</code>
				</dd>
				<dt>
					{{ 'Reset'|trans }}
				</dt>
				<dd>
					<code>0</code>
				</dd>
			</dl>
		</div>

		<div class="tify-help_section -selection">
			<h3>{{ 'Selecting Multiple Pages'|trans }}</h3>
			<p v-html="$root.$options.filters.trans(
				'Open the pages view and use <code>Ctrl</code> + <code>Click</code> (or long press if you are using a touch screen) to select multiple pages.'
			)"/>
		</div>

		<div class="tify-help_section -about">
			<h3>{{ 'About'|trans }}</h3>
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
				<a :href="env.HOMEPAGE">{{ 'Website'|trans }}</a>
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
	};
</script>
