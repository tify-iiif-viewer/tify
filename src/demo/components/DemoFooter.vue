<script>
export default {
	computed: {
		env: () => ENV,
	},
};
</script>

<template>
	<footer>
		<a
			:href="env.repositoryUrl"
			aria-label="TIFY @ GitHub"
		>
			<IconGithub />
			TIFY
		</a>
	</footer>
</template>

<style lang="scss" scoped>
@import '../imports';

a {
	color: $link-color;
	display: inline-flex;
	gap: .2em;
	text-decoration: none;

	@include hover {
		color: $link-hover-color;
	}
}

footer {
	padding: .5rem 0 1rem;
	text-align: center;
	width: 100%;
}
</style>
