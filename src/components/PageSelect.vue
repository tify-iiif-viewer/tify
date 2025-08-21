<script>
export default {
	data() {
		return {
			filter: '',
			filteredCanvases: [],
			highlightIndex: 0,
		};
	},
	watch: {
		filter() {
			this.updateFilteredCanvases();
			this.$nextTick(() => this.updateScroll());
		},
	},
	mounted() {
		this.updateFilteredCanvases();
	},
	methods: {
		onKeyDownArrow() {
			if (this.highlightIndex < this.filteredCanvases.length - 1) {
				this.highlightIndex += 1;
				this.updateScroll();
			}
		},
		onKeyUpArrow() {
			if (this.highlightIndex > 0) {
				this.highlightIndex -= 1;
				this.updateScroll();
			}
		},
		onOpen() {
			this.filter = '';
			this.highlightIndex = this.$store.options.pages.at(-1) - 1;

			this.$nextTick(() => {
				// No autofocus on (presumed) touchscreens to
				// prevent touch keyboard from shifting view
				if (!window.matchMedia('(pointer: coarse)').matches) {
					this.$refs.search.focus();
				}

				this.updateScroll();
			});
		},
		resetFilter(event) {
			if (this.filter) {
				this.filter = '';
				event.stopPropagation();
			}
		},
		setPage(page) {
			this.$store.setPage(page);

			if (!this.$store.isContainerWidthAtLeast('medium')) {
				this.$store.updateOptions({ view: null });
			}
		},
		updateFilteredCanvases() {
			const filteredCanvases = [];
			const filter = this.filter.toLowerCase();
			let highlightIndex = -1;
			this.$store.manifest.items.forEach((canvas, index) => {
				const label = this.$store.localize(canvas.label);
				const labelMatchesFilter = label.toLowerCase().includes(filter);
				const pageMatchesFilter = (index + 1).toFixed().includes(filter);
				if (labelMatchesFilter || pageMatchesFilter) {
					const item = canvas;
					item.page = index + 1;
					if (item.page === this.$store.options.pages[0]) {
						highlightIndex = filteredCanvases.length;
					}

					filteredCanvases.push(item);
				}
			});
			this.highlightIndex = highlightIndex < 0
				? 0
				: highlightIndex;
			this.filteredCanvases = filteredCanvases;
		},
		updateScroll() {
			const { list } = this.$refs;
			const currentItem = list.children[this.highlightIndex];
			if (list && currentItem) {
				list.scrollTop = currentItem.offsetTop - (list.offsetHeight / 2) + (currentItem.offsetHeight / 2);
			}
		},
	},
};
</script>

<template>
	<AppDropdown
		class="tify-page-select"
		shortcut="x"
		@open="onOpen"
	>
		<template #button>
			<!-- NOTE: Trailing spaces in elements are removed in production build -->
			<span class="tify-sr-only">{{ `${$translate('Current Page')} ` }}</span>
			<PageName :number="$store.options.pages.find(page => page > 0)" />
			<span class="tify-sr-only"> / {{ $translate('Toggle page select') }}</span>
		</template>

		<div class="tify-page-select-filter">
			<input
				ref="search"
				v-model="filter"
				:aria-label="$translate('Filter pages')"
				type="text"
				class="tify-page-select-input"
				@keyup.enter="$refs.list.querySelectorAll('a')[highlightIndex].click()"
				@keydown.esc="resetFilter()"
				@keydown.up.prevent="onKeyUpArrow()"
				@keydown.down.prevent="onKeyDownArrow()"
			/>
		</div>
		<ol
			ref="list"
			class="tify-link-list tify-page-select-list"
		>
			<li
				v-for="(canvas, index) in filteredCanvases"
				:key="index"
			>
				<!-- eslint-disable-next-line vuejs-accessibility/anchor-has-content -->
				<a
					href="javascript:;"
					:class="{
						'-current': $store.options.pages.includes(canvas.page),
						'-highlighted': highlightIndex === index,
					}"
					@click="setPage(canvas.page)"
				>
					<PageName
						:number="canvas.page"
						:wrap="true"
					/>
				</a>
			</li>
		</ol>
	</AppDropdown>
</template>
