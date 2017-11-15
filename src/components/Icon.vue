<template>
	<i :class="`tify-icon -${name}`">{{ name }}</i>
</template>

<script>
	export default {
		props: [
			'name',
		],
	};
</script>
