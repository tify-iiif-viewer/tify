<script>
export default {
	computed: {
		env: () => ENV,
	},
};
</script>

<template>
	<section
		class="tify-help"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Help') }}
		</h2>

		<h3>{{ $translate('About TIFY') }}</h3>

		<p v-html="$translate('$info')" />

		<ul class="tify-list">
			<li>
				<a
					:href="`${env.blobBaseUrl}/doc/index.md`"
					rel="noopener noreferrer"
					target="_blank"
				>{{ $translate('Documentation') }}</a>
			</li>
			<li>
				<a
					:href="env.bugsUrl"
					rel="noopener noreferrer"
					target="_blank"
				>{{ $translate('Report a bug') }}</a>
			</li>
			<li>
				<a
					:href="env.repositoryUrl"
					rel="noopener noreferrer"
					target="_blank"
				>{{ $translate('Source code') }}</a>
			</li>
		</ul>

		<footer class="tify-help-footer">
			<p v-html="$translate('$copyright')" />
			<p>{{ $translate('Version') }} <b>{{ env.version }}</b></p>
		</footer>
	</section>
</template>
