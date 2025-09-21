<script>
export default {
	props: {
		instance: {
			type: Object,
			required: true,
		},
	},
	emits: ['change'],
};
</script>

<template>
	<AppDropdown :label="$translate('Language', instance)">
		<template #button>
			<IconEarth />
			<span class="code">{{ instance.language }}</span>
		</template>

		<ol class="tify-button-list">
			<li
				v-for="(translation, code) in $translations"
				:key="code"
			>
				<a
					href="javascript:;"
					:class="{ current: instance.language === code }"
					@click="$emit('change', code)"
				>
					{{ translation.$language }}
				</a>
			</li>
		</ol>
	</AppDropdown>
</template>

<style lang="scss" scoped>
@import '../imports';

.code {
	margin: auto;
	transform: translate(-.1em); // center visually
}

.current {
	@extend %button-active;
}

:deep(.tify-dropdown-button) {
	@extend %button-borderless;
	justify-content: start;
	min-width: 2.75rem;
	padding-right: 0;
	text-transform: uppercase;
}
</style>
