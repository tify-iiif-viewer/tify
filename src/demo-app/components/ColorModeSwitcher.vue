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
		aria-description="TIFY color mode"
		role="radiogroup"
	>
		<li v-for="colorMode in ['auto', 'light', 'dark']" :key="colorMode">
			<label class="radio">
				<input
					type="radio"
					:value="colorMode"
					:checked="instance.colorMode === colorMode"
					:aria-label="$translate(colorMode, instance)"
					:title="$translate(colorMode, instance)"
					@click="$emit('change', colorMode)"
				>
				<IconThemeLightDark v-if="colorMode === 'auto'" />
				<IconWeatherSunny v-else-if="colorMode === 'light'" />
				<IconWeatherNight v-else />
			</label>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
@import '../../styles/util/settings';
@import '../../styles/functions/*';
@import '../../styles/mixins/*';
@import '../../styles/extends/*';

ul {
	display: flex;
	list-style: none;
}

li {
	display: flex;
	flex: 1;
}

[type=radio] {
	opacity: 0;
	pointer-events: none;
	position: absolute;
}

.radio {
	@extend %button;
	border-radius: 0;
	display: flex;
	margin-left: -1px;
	padding: .25rem;

	:first-child > & {
		border-radius: $br 0 0 $br;
		margin: 0;
	}

	:last-child > & {
		border-radius: 0 $br $br 0;
	}

	&:has(:focus-visible) {
		outline: 1px solid $link-color;
	}

	&:has(:checked) {
		background: $link-color !important;
		color: $text-color-inverted;
	}
}
</style>
