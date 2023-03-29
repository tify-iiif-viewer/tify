import { computed } from 'vue';
import { isValidPagesArray, options, pageCount, updateOptions } from './store';

export const customPageViewActive = computed(() => {
	if (!options.pages) {
		return false;
	}

	const { pages } = options;
	return pages.length > 2
		|| (pages.length === 2 && (pages[0] % 2 > 0 || pages[1] !== pages[0] + 1) && pages[1] > 0);
});

export function setPage(pageOrPages) {
	let pages = pageOrPages;
	if (!Array.isArray(pageOrPages)) {
		pages = [pageOrPages];
	}

	if (!isValidPagesArray(pages)) {
		throw new RangeError('Invalid pages');
	}

	if (pages.length === 1
		&& options.pages
		&& options.pages[0] % 2 < 1
		&& (options.pages[1] === options.pages[0] + 1 || options.pages[1] === 0)
	) {
		const p = pages[0] % 2 > 0 ? pages[0] - 1 : pages[0];
		pages = [p, p === pageCount.value ? 0 : p + 1];
	}

	updateOptions({ pages });
	return pages;
}

export const isFirstPage = computed(() => options.pages[0] < 2);

export const isLastPage = computed(() => {
	const { pages } = options;
	return pages[0] >= pageCount.value || pages[pages.length - 1] >= pageCount.value;
});

export function goToFirstPage() {
	setPage(1);
}

export function goToNextPage() {
	const { pages } = options;
	let page = pages[0] + 1;
	if (pages.length > 1 && page % 2 > 0 && page < pageCount.value) {
		page += 1;
	}

	setPage(page);
}

export function goToLastPage() {
	setPage(pageCount.value);
}

export function goToPreviousPage() {
	const { pages } = options;
	let page = pages[0] - 1;
	if (pages.length > 1 && page % 2 > 0 && page > 0) {
		page -= 1;
	}

	setPage(page);
}
