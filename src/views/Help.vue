<template>
	<section class="tify-fulltext">
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
					{{ 'or'|trans }}
					<code>=</code>
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
					{{ 'or'|trans }}
					<code>_</code>
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
	</section>
</template>
