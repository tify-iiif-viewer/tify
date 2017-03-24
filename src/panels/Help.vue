<template>
	<section class="tify-transcript">
		<h2 class="tify-sr-only">{{ 'Help'|trans }}</h2>

		<!--TODO-->

		<h3>Key Bindings</h3>
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

			<tr>
				<!--TODO: This only works when scan has focus-->
				<th><code>0</code> (zero)</th>
				<td>Reset view</td>
			</tr>
		</table>
	</section>
</template>
