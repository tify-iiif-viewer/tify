module.exports = {
	computed: {
		customPageViewActive() {
			const { pages } = this.$root.options;
			return pages.length > 2
				|| (pages.length === 2 && (pages[0] % 2 > 0 || pages[1] !== pages[0] + 1) && pages[1] > 0);
		},
		isFirstPage() {
			return this.$root.options.pages[0] < 2;
		},
		isLastPage() {
			const { pages } = this.$root.options;
			const count = this.$root.pageCount;
			return pages[0] >= count || pages[pages.length - 1] >= count;
		},
	},
	methods: {
		goToFirstPage() {
			this.$root.setPage(1);
		},
		goToNextPage() {
			const { pages } = this.$root.options;
			let page = pages[0] + 1;
			if (pages.length > 1 && page % 2 > 0 && page < this.$root.pageCount) {
				page += 1;
			}

			this.$root.setPage(page);
		},
		goToLastPage() {
			this.$root.setPage(this.$root.pageCount);
		},
		goToPreviousPage() {
			const { pages } = this.$root.options;
			let page = pages[0] - 1;
			if (pages.length > 1 && page % 2 > 0 && page > 0) {
				page -= 1;
			}

			this.$root.setPage(page);
		},
	},
};
