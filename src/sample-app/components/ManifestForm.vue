<script>
export default {
	props: {
		instance: {
			type: Object,
			required: true,
		},
		modelValue: {
			type: String,
			default: '',
		},
	},
	emits: [
		'load',
		'update:modelValue',
	],
};
</script>

<template>
	<form
		style="
			display: flex;
			flex: 1;
			gap: .25rem;
		"
		@submit.prevent="$emit('load')"
	>
		<!-- NOTE: ID required for local input history -->
		<input
			:id="`manifest${instance.id}`"
			type="url"
			class="input"
			:aria-label="$t('IIIF manifest URL', instance)"
			:placeholder="$t('IIIF manifest URL', instance)"
			:value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)"
			@focus="$event.target.select()"
		>
		<button
			type="submit"
			class="button"
			:disabled="!instance.manifestUrl"
		>
			{{ $t('Load', instance) }}
		</button>
	</form>
</template>

<style lang="scss" scoped>
@import '../../styles/util/settings';
@import '../../styles/functions/*';
@import '../../styles/mixins/*';
@import '../../styles/extends/*';

.input {
	background: none;
	border: 1px solid transparent;
	border-radius: $br;
	color: $link-color;
	font-size: 16px;
	flex: 1;
	min-width: 0;
	padding: calc(.125rem - 1px) calc(.25rem - 1px);
}

.input:focus {
	background:
		linear-gradient($header-bg, $header-bg),
		linear-gradient($header-bg 80%, $link-color 80%);
	background-origin: border-box;
	background-clip: padding-box, border-box;
	outline: none;
}
</style>
