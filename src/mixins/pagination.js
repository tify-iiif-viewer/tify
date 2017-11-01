module.exports = {
	methods: {
		goToFirstPage() {
			this.$root.setPage(1);
		},
		goToLastPage() {
			this.$root.setPage(this.$root.pageCount);
		},
		goToNextPage() {
			const { pages } = this.$root.params;
			let page = pages[0] + 1;
			if (pages.length > 1 && page % 2 > 0 && page < this.$root.pageCount) page += 1;
			this.$root.setPage(page);
		},
		goToPreviousPage() {
			const { pages } = this.$root.params;
			let page = pages[0] - 1;
			if (pages.length > 1 && page % 2 > 0 && page > 0) page -= 1;
			this.$root.setPage(page);
		},
	},
};
