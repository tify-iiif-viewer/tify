<script>
export default {
	props: {
		instance: {
			type: Object,
			required: true,
		},
	},
	emits: [
		'change',
	],
};
</script>

<template>
	<ul
		aria-label="Color mode"
		role="toolbar"
	>
		<li
			v-for="colorMode in ['auto', 'light', 'dark']"
			:key="colorMode"
		>
			<button
				type="button"
				:aria-label="$translate(colorMode, instance)"
				:aria-pressed="instance.colorMode === colorMode"
				:title="$translate(colorMode, instance)"
				@click="$emit('change', colorMode)"
			>
				<IconThemeLightDark v-if="colorMode === 'auto'" />
				<IconWeatherSunny v-else-if="colorMode === 'light'" />
				<IconWeatherNight v-else />
			</button>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
@import '../imports';

ul {
	display: flex;
	gap: 1px;
	list-style: none;
}

button {
	@extend %button-borderless;
	display: flex;

	&[aria-pressed=true] {
		background: $link-color !important;
		color: $text-color-inverted !important;
	}
}
</style>
