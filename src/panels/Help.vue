<template>
	<section class="tify-transcript">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<!--TODO-->

		<h3>Key Bindings</h3>
		<h4>Global</h4>
		<table>
			<tr>
				<th><code>,</code> (comma)</th>
				<td>Previous page</td>
			</tr>

			<tr>
				<th><code>.</code> (period)</th>
				<td>Next page</td>
			</tr>

			<tr>
				<th><code>Home</code></th>
				<td>First page</td>
			</tr>

			<tr>
				<th><code>End</code></th>
				<td>Last page</td>
			</tr>
		</table>
		<h4>Scan</h4>
		<table>
			<tr>
				<th><code>+</code> (plus)</th>
				<td>Zoom in</td>
			</tr>
			<tr>
				<th><code>-</code> (minus)</th>
				<td>Zoom out</td>
			</tr>
			<tr>
				<th><code>&larr;</code> <code>&rarr;</code> <code>&uarr;</code> <code>&darr;</code></th>
				<td>Pan</td>
			</tr>
			<tr>
				<th><code>0</code> (zero)</th>
				<td>Reset view</td>
			</tr>
		</table>
	</section>
</template>
