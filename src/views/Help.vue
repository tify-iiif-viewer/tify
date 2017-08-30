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
						{{ 'Table of Contents'|trans }}
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
					<td>{{ version }}</td>
				</tr>
				<tr>
					<th>{{ 'Author'|trans }}</th>
					<td v-html="linkMailAdresses(author)"/>
				</tr>
				<tr>
					<th>{{ 'License'|trans }}</th>
					<td>{{ license }}</td>
				</tr>
				<tr>
					<th>{{ 'Source'|trans }}</th>
					<td><a :href="repositoryUrl">GitHub</a></td>
				</tr>
			</table>
			<p v-if="bugsUrl">
				{{ 'Found a bug?'|trans }}
				<a :href="bugsUrl">{{ 'Please let us know.'|trans }}</a>
			</p>
			<p v-if="homepage">
				<a :href="homepage">{{ 'Website'|trans }}</a>
			</p>
		</div>
	</section>
</template>

<script>
	export default {
		data() {
			return {
				author: process.env.AUTHOR_NAME,
				bugsUrl: process.env.BUGS_URL,
				homepage: process.env.HOMEPAGE,
				license: process.env.LICENSE,
				repositoryUrl: process.env.REPOSITORY_URL,
				version: process.env.VERSION,
			};
		},

		methods: {
			linkMailAdresses(string) {
				const stringWithLinks = string.replace(/(.*?)<?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)>?(\s*)/gi, '<a href="mailto:$2">$1</a>$3');
				return stringWithLinks;
			},
		},
	};
</script>
