<template>
	<div class="tify-header-button-group -pagination">
		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('First page')"
			@click="$store.goToFirstPage()"
		>
			<icon-page-first />
		</button>

		<button
			v-if="$store.manifest.structures"
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('Previous section')"
			@click="$store.goToPreviousSection()"
		>
			<icon-skip-previous />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isFirstPage"
			:title="$translate('Previous page')"
			@click="$store.goToPreviousPage()"
		>
			<icon-chevron-left />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastPage"
			:title="$translate('Next page')"
			@click="$store.goToNextPage()"
		>
			<icon-chevron-right />
		</button>

		<button
			v-if="$store.manifest.structures"
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastSection"
			:title="$translate('Next section')"
			@click="$store.goToNextSection()"
		>
			<icon-skip-next />
		</button>

		<button
			type="button"
			class="tify-header-button"
			:disabled="$store.isCustomPageView || $store.isLastPage"
			:title="$translate('Last page')"
			@click="$store.goToLastPage()"
		>
			<icon-page-last />
		</button>
	</div>
</template>

<script />
