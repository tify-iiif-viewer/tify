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
	computed: {
		languages() {
			return window.tifyLanguages;
		},
	},
};
</script>

<template>
	<p>
		<select
			:value="instance.language"
			class="select"
			aria-label="TIFY Language"
			@change="$emit('change', $event.target.value)"
		>
			<option
				v-for="name, code in languages"
				:key="code"
				:value="code"
			>
				{{ name }}
			</option>
		</select>
	</p>
</template>

<style lang="scss" scoped>
@import '../../styles/util/settings';
@import '../../styles/functions/*';
@import '../../styles/mixins/*';
@import '../../styles/extends/*';

.select {
	@extend %button;
	text-align: left;
	width: 100%;
}
</style>
