<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<div class="tify-help_section -keys">
			<h3>{{ 'Key Bindings'|trans }}</h3>

			<h4>{{ 'View'|trans }}</h4>
			<table>
				<tr>
					<th>
						{{ 'Fulltext'|trans }}
						<small v-html="$options.filters.trans('(if&nbsp;available)')"/>
					</th>
					<td>
						<code>{{ '1' }}</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Pages'|trans }}</th>
					<td>
						<code>{{ '2' }}</code>
					</td>
				</tr>
				<tr>
					<th>
						{{ 'Contents'|trans }}
						<small v-html="$options.filters.trans('(if&nbsp;available)')"/>
					</th>
					<td>
						<code>{{ '3' }}</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Info'|trans }}</th>
					<td>
						<code>{{ '4' }}</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Export'|trans }}</th>
					<td>
						<code>{{ '5' }}</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Help'|trans }}</th>
					<td>
						<code>{{ '6' }}</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Scan'|trans }}</th>
					<td>
						<code>{{ 'Backspace'|trans }}</code>
					</td>
				</tr>
			</table>

			<h4>{{ 'Turning Pages'|trans }}</h4>
			<table>
				<tr>
					<th>{{ 'Previous page'|trans }}</th>
					<td>
						<code>Q</code>
						{{ 'or'|trans }}
						<code>,</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Next page'|trans }}</th>
					<td>
						<code>E</code>
						{{ 'or'|trans }}
						<code>.</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'First page'|trans }}</th>
					<td><code>&#8679;</code> + <code>Q</code></td>
				</tr>
				<tr>
					<th>{{ 'Last page'|trans }}</th>
					<td><code>&#8679;</code> + <code>E</code></td>
				</tr>
				<tr>
					<th>{{ 'Jump to page'|trans }}</th>
					<td><code>X</code></td>
				</tr>
				<tr>
					<th>{{ 'Toggle double-page'|trans }}</th>
					<td><code>B</code></td>
				</tr>
			</table>

			<h4>{{ 'Scan' }}</h4>
			<table>
				<tr>
					<th>{{ 'Zoom in'|trans }}</th>
					<td>
						<code>&#8679;</code> + <code>W</code>
						{{ 'or'|trans }}
						<code>+</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Zoom out'|trans }}</th>
					<td>
						<code>&#8679;</code> + <code>S</code>
						{{ 'or'|trans }}
						<code>-</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Pan'|trans }}</th>
					<td>
						<code>W</code> <code>S</code> <code>A</code> <code>D</code>
					</td>
				</tr>
				<tr>
					<th>{{ 'Reset'|trans }}</th>
					<td><code>0</code></td>
				</tr>
			</table>
		</div>

		<div class="tify-help_section -selection">
			<h3>{{ 'Selecting Multiple Pages'|trans }}</h3>
			<p v-html="$root.$options.filters.trans(
				'Open the pages view and use <code>Ctrl</code> + <code>Click</code> (or long press if you are using a touch screen) to select multiple pages.'
			)"/>
		</div>

		<div class="tify-help_section -about">
			<h3>{{ 'About'|trans }}</h3>
			<p v-html="$root.$options.filters.trans('TIFY is a fast and mobile-friendly IIIF document viewer.')"/>
			<table>
				<tr>
					<th>{{ 'Version'|trans }}</th>
					<td>{{ env.VERSION }}</td>
				</tr>
				<tr>
					<th>{{ 'Author'|trans }}</th>
					<td><a :href="`mailto:${env.AUTHOR_EMAIL}`">{{env.AUTHOR_NAME}}</a></td>
				</tr>
				<tr>
					<th>{{ 'License'|trans }}</th>
					<td>{{ env.LICENSE }}</td>
				</tr>
				<tr>
					<th>{{ 'Source'|trans }}</th>
					<td><a :href="env.REPOSITORY_URL">GitHub</a></td>
				</tr>
			</table>
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
