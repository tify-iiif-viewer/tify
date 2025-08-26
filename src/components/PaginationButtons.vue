<script>
</script>

<template>
	<div
		class="tify-header-button-group -pagination"
		:class="{ '-reversed': $store.isReversed, '-vertical': $store.isVertical }"
	>
		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isFirstPage"
			:title="$translate('First page')"
			:aria-label="$translate('First page')"
			@click="$store.goToFirstPage()"
		>
			<IconPageFirst />
		</button>

		<button
			v-if="$store.sections.length > 1"
			type="button"
			class="tify-header-button"
			:disabled="$store.isFirstPage"
			:title="$translate('Previous section')"
			:aria-label="$translate('Previous section')"
			@click="$store.goToPreviousSection()"
		>
			<IconSkipPrevious />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isFirstPage"
			:title="$translate('Previous page')"
			:aria-label="$translate('Previous page')"
			@click="$store.goToPreviousPage()"
		>
			<IconChevronLeft />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isLastPage"
			:title="$translate('Next page')"
			:aria-label="$translate('Next page')"
			@click="$store.goToNextPage()"
		>
			<IconChevronRight />
		</button>

		<button
			v-if="$store.sections.length > 1"
			type="button"
			class="tify-header-button"
			:disabled="$store.isLastSection"
			:title="$translate('Next section')"
			:aria-label="$translate('Next section')"
			@click="$store.goToNextSection()"
		>
			<IconSkipNext />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isLastPage"
			:title="$translate('Last page')"
			:aria-label="$translate('Last page')"
			@click="$store.goToLastPage()"
		>
			<IconPageLast />
		</button>
	</div>
</template>
