<template>
	<div class="tify-header-button-group -pagination">
		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('First page')"
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
			@click="$store.goToPreviousSection()"
		>
			<IconSkipPrevious />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('Previous page')"
			@click="$store.goToPreviousPage()"
		>
			<IconChevronLeft />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastPage"
			:title="$translate('Next page')"
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
			@click="$store.goToNextSection()"
		>
			<IconSkipNext />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastPage"
			:title="$translate('Last page')"
			@click="$store.goToLastPage()"
		>
			<IconPageLast />
		</button>
	</div>
</template>

<script />
