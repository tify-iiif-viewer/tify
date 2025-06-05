<script>
</script>

<template>
	<div class="tify-header-button-group -pagination">
		<button
			type="button"
			class="tify-header-button"
			:disabled="!$store.ifShowLeftButton"
			:title="$translate($store.viewingDirection === 'right-to-left' ? 'Last page' : 'First page')"
			:aria-label="$translate($store.viewingDirection === 'right-to-left' ? 'First page' : 'Last page')"
			@click="$store.viewingDirection === 'right-to-left' ? $store.goToLastPage() : $store.goToFirstPage()"
		>
			<IconPageFirst />
		</button>

		<button
			v-if="$store.sections.length > 1"
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate($store.viewingDirection === 'right-to-left' ? 'Next section' : 'Previous section')"
			:aria-label="$translate($store.viewingDirection === 'right-to-left' ? 'Previous section' : 'Next section')"
			@click="$store.viewingDirection === 'right-to-left' ? $store.goToNextSection() : $store.goToPreviousSection()"
		>
			<IconSkipPrevious />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="!$store.ifShowLeftButton"
			:title="$translate($store.leftButtonLabel)"
			:aria-label="$translate($store.leftButtonLabel)"
			@click="$store.goToLeftPage()"
		>
			<IconChevronLeft />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="!$store.ifShowRightButton"
			:title="$translate($store.rightButtonLabel)"
			:aria-label="$translate($store.rightButtonLabel)"
			@click="$store.goToRightPage()"
		>
			<IconChevronRight />
		</button>

		<button
			v-if="$store.sections.length > 1"
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastSection"
			:title="$translate($store.viewingDirection === 'right-to-left' ? 'Previous section' : 'Next section')"
			:aria-label="$translate($store.viewingDirection === 'right-to-left' ? 'Previous section' : 'Next section')"
			@click="$store.viewingDirection === 'right-to-left' ? $store.goToPreviousSection() : $store.goToNextSection()"
		>
			<IconSkipNext />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="!$store.ifShowRightButton"
			:title="$translate($store.viewingDirection === 'right-to-left' ? 'First page' : 'Last page')"
			:aria-label="$translate($store.viewingDirection === 'right-to-left' ? 'First page' : 'Last page')"
			@click="$store.viewingDirection === 'right-to-left' ? $store.goToFirstPage() : $store.goToLastPage()"
		>
			<IconPageLast />
		</button>
	</div>
</template>
