<script>
// TODO: Swap pages when rtl and double-page

export default {
	computed: {
		buttons() {
			const rtl = this.$store.manifest.viewingDirection === 'right-to-left';

			const buttons = [
				{
					disabled: this.$store.isCustomPageView || this.$store.isFirstPage,
					title: this.$translate('First page'),
					onClick: this.$store.goToFirstPage,
					icon: rtl ? 'IconPageLast' : 'IconPageFirst',
				},
				{
					hidden: this.$store.sections.length < 2,
					disabled: this.$store.isCustomPageView || this.$store.isFirstPage,
					title: this.$translate('Previous section'),
					onClick: this.$store.goToPreviousSection,
					icon: rtl ? 'IconSkipNext' : 'IconSkipPrevious',
				},
				{
					disabled: this.$store.isCustomPageView || this.$store.isFirstPage,
					title: this.$translate('Previous page'),
					onClick: this.$store.goToPreviousPage,
					icon: rtl ? 'IconChevronRight' : 'IconChevronLeft',
				},
				{
					disabled: this.$store.isCustomPageView || this.$store.isLastPage,
					title: this.$translate('Next page'),
					onClick: this.$store.goToNextPage,
					icon: rtl ? 'IconChevronLeft' : 'IconChevronRight',
				},
				{
					hidden: this.$store.sections.length < 2,
					disabled: this.$store.isCustomPageView || this.$store.isLastSection,
					title: this.$translate('Next section'),
					onClick: this.$store.goToNextSection,
					icon: rtl ? 'IconSkipPrevious' : 'IconSkipNext',
				},
				{
					disabled: this.$store.isCustomPageView || this.$store.isLastPage,
					title: this.$translate('Last page'),
					onClick: this.$store.goToLastPage,
					icon: rtl ? 'IconPageFirst' : 'IconPageLast',
				},
			];

			if (rtl) {
				buttons.reverse();
			}

			return buttons.filter((button) => !button.hidden);
		},
	},
};
</script>

<template>
	<div class="tify-header-button-group -pagination">
		<button
			v-for="button in buttons"
			:key="button.icon"
			type="button"
			class="tify-header-button"
			:disabled="button.disabled"
			:title="button.title"
			:aria-label="button.title"
			@click="button.onClick"
		>
			<!-- NOTE: Avoiding <component :is="…" /> in favor of unplugin-vue-components -->
			<IconChevronLeft v-if="button.icon === 'IconChevronLeft'" />
			<IconChevronRight v-else-if="button.icon === 'IconChevronRight'" />
			<IconPageFirst v-else-if="button.icon === 'IconPageFirst'" />
			<IconPageLast v-else-if="button.icon === 'IconPageLast'" />
			<IconSkipNext v-else-if="button.icon === 'IconSkipNext'" />
			<IconSkipPrevious v-else-if="button.icon === 'IconSkipPrevious'" />
		</button>
	</div>
</template>
