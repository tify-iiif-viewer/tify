<script>
</script>

<template>
	<div class="tify-header-button-group -pagination">
		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('First page')"
			:aria-label="$translate('First page')"
			@click="$store.goToFirstPage()"
		>
			<IconPageFirst />
		</button>

		<button
			v-if="$store.manifest.structures"
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('Previous section')"
			:aria-label="$translate('Previous section')"
			@click="$store.goToPreviousSection()"
		>
			<IconSkipPrevious />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('Previous page')"
			:aria-label="$translate('Previous page')"
			@click="$store.goToPreviousPage()"
		>
			<IconChevronLeft />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastPage"
			:title="$translate('Next page')"
			:aria-label="$translate('Next page')"
			@click="$store.goToNextPage()"
		>
			<IconChevronRight />
		</button>

		<button
			v-if="$store.manifest.structures"
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastSection"
			:title="$translate('Next section')"
			:aria-label="$translate('Next section')"
			@click="$store.goToNextSection()"
		>
			<IconSkipNext />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastPage"
			:title="$translate('Last page')"
			:aria-label="$translate('Last page')"
			@click="$store.goToLastPage()"
		>
			<IconPageLast />
		</button>
	</div>
</template>
