<script>
export default {
	props: {
		instance: {
			type: Object,
			required: true,
		},
	},
	emits: ['change'],
	computed: {
		languages() {
			const collator = new Intl.Collator('und'); // und = undetermined, i.e. language-agnostic
			return Object
				.entries(this.$translations)
				.map(([code, translation]) => ({
					code,
					name: translation.$language,
				}))
				.sort((a, b) => collator.compare(a.name, b.name));
		},
	},
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
				v-for="language in languages"
				:key="language.code"
			>
				<a
					href="javascript:;"
					:class="{ current: instance.language === language.code }"
					@click="$emit('change', language.code)"
				>
					{{ language.name }}
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
