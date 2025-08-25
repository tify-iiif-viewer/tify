<script>
export default {
	emits: [
		'update',
	],
	computed: {
		saturation() {
			const saturation = this.$store.options.filters.saturate;
			return typeof saturation === 'number' ? saturation : 1;
		},
	},
};
</script>

<template>
	<p>
		<label>
			<IconLightbulbOnOutline />
			{{ $translate('Brightness') }}
			<b>{{ Math.round(($store.options.filters.brightness || 1) * 100) }}&nbsp;%</b>
			<input
				ref="firstSlider"
				max="2"
				min=".5"
				step=".01"
				type="range"
				:value="$store.options.filters.brightness || 1"
				@input="$emit('update', 'brightness', $event)"
			/>
		</label>
	</p>
	<p>
		<label>
			<IconCircleHalfFull />
			{{ $translate('Contrast') }}
			<b>{{ Math.round(($store.options.filters.contrast || 1) * 100) }}&nbsp;%</b>
			<input
				max="2"
				min=".5"
				step=".01"
				type="range"
				:value="$store.options.filters.contrast || 1"
				@input="$emit('update', 'contrast', $event)"
			/>
		</label>
	</p>
	<p>
		<label>
			<IconPaletteOutline />
			{{ $translate('Saturation') }}
			<b>{{ Math.round(saturation * 100) }}&nbsp;%</b>
			<input
				max="3"
				min="0"
				step=".01"
				type="range"
				:value="saturation"
				@input="$emit('update', 'saturate', $event)"
			/>
		</label>
	</p>
</template>
