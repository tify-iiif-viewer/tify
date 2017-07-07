<template>
	<section class="tify-help">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<h3>{{ 'Key Bindings'|trans }}</h3>
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
				<th>{{ 'Zoom in'|trans }}</th>
				<td>
					<code>&#8679;</code> + <code>W</code>
					{{ 'or'|trans }}
					<code>&#8679;</code> + <code>&uarr;</code>
					{{ 'or'|trans }}
					<code>+</code>
				</td>
			</tr>
			<tr>
				<th>{{ 'Zoom out'|trans }}</th>
				<td>
					<code>&#8679;</code> + <code>S</code>
					{{ 'or'|trans }}
					<code>&#8679;</code> + <code>&darr;</code>
					{{ 'or'|trans }}
					<code>-</code>
				</td>
			</tr>
			<tr>
				<th>{{ 'Pan'|trans }}</th>
				<td>
					<code>W</code> <code>S</code> <code>A</code> <code>D</code>
					{{ 'or'|trans }}
					<code>&uarr;</code> <code>&darr;</code> <code>&larr;</code> <code>&rarr;</code>
				</td>
			</tr>
			<tr>
				<th>{{ 'Reset view'|trans }}</th>
				<td><code>0</code></td>
			</tr>
		</table>

		<h3>{{ 'Selecting Multiple Pages'|trans }}</h3>
		<p v-html="this.$root.$options.filters.trans(
			'Open the pages view and use <code>Ctrl</code> + <code>Click</code> (or long press if you are using a touch screen) to select multiple pages.'
		)"></p>

		<h3>{{ 'About'|trans }}</h3>
		<p>{{ description|trans }}</p>
		<table>
			<tr>
				<th>{{ 'Version'|trans }}</th>
				<td>{{ version }}</td>
			</tr>
			<tr>
				<th>{{ 'Author'|trans }}</th>
				<td v-html="linkMailAdresses(author)"></td>
			</tr>
			<tr v-if="homepage !== repository.url">
				<th>{{ 'Homepage'|trans }}</th>
				<td>{{ homepage }}</td>
			</tr>
			<tr>
				<th>{{ 'Source'|trans }}</th>
				<td><a :href="repository.url">GitHub</a></td>
			</tr>
			<tr>
				<th>{{ 'License'|trans }}</th>
				<td>{{ license }}</td>
			</tr>
		</table>
	</section>
</template>

<script>
	import { author, description, homepage, license, repository, version } from '../../package.json';

	export default {
		data() {
			return {
				author,
				description,
				homepage,
				license,
				repository,
				version,
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
