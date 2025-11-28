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
	methods: {
		getLabel(colorMode) {
			if (colorMode === 'auto') {
				return this.$translate('automatic', this.instance);
			}

			if (colorMode === 'light') {
				return this.$translate('light [adjective]', this.instance);
			}

			return this.$translate('dark', this.instance);
		},
	},
};
</script>

<template>
	<ul
		:aria-label="$translate('Color mode', instance)"
		role="toolbar"
	>
		<li
			v-for="colorMode in ['auto', 'light', 'dark']"
			:key="colorMode"
		>
			<button
				type="button"
				:aria-label="getLabel(colorMode)"
				:aria-pressed="instance.colorMode === colorMode"
				:title="getLabel(colorMode)"
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
