<template>
	<div class="tify-page-select">
		<button
			class="tify-page-select_button"
			:title="pageTitleAttr"
			:aria-label="$root.translate('Current page')"
			v-click-outside="closeDropdown"
			@click="toggleDropdown"
		>
			{{ getCurrentPage() }}
		</button>

		<div
			class="tify-page-select_dropdown"
			key="dropdown"
			v-show="isOpen"
			@click.stop
		>
			<div class="tify-page-select_filter">
				<input
					:aria-label="$root.translate('Filter pages')"
					type="text"
					class="tify-page-select_input"
					ref="search"
					v-model="filter"
					@keyup.enter="(filteredCanvases[highlightIndex]) && setPage(filteredCanvases[highlightIndex].page)"
					@keydown.esc.prevent="filter ? filter = '' : closeDropdown()"
					@keydown.up.prevent="onKeyUpArrow()"
					@keydown.down.prevent="onKeyDownArrow()"
				>
			</div>
			<ol class="tify-page-select_list" ref="list">
				<li
					:key="index"
					v-for="(canvas, index) in filteredCanvases"
					:class="{
						'-current': $root.options.pages.indexOf(canvas.page) > -1,
						'-highlighted': highlightIndex === index,
					}"
				>
					<a href="javascript:;" @click="setPage(canvas.page)">
						{{ $root.getPageLabel(canvas.page, $root.convertValueToArray(canvas.label)[0]) }}
					</a>
				</li>
			</ol>
		</div>
	</div>
</template>

<script>
import keyboard from '../mixins/keyboard';

export default {
	mixins: [
		keyboard,
	],
	data() {
		return {
			filter: '',
			filteredCanvases: [],
			highlightIndex: 0,
			isOpen: false,
		};
	},
	computed: {
		pageTitleAttr() {
			const { pages } = this.$root.options;
			const page = (pages[0] === 0 && pages.length > 1 ? 1 : pages[0]);
			const physLabel = this.$root.translate('Physical page');
			const logLabel = this.$root.translate('Logical page');
			return `${physLabel}: ${page}\n`
					+ `${logLabel}: ${this.$root.convertValueToArray(this.$root.canvases[page - 1].label)[0]}`;
		},
	},
	watch: {
		filter() {
			this.updateFilteredCanvases();
			this.$nextTick(() => this.updateScroll());
		},
		isOpen() {
			if (!this.isOpen) {
				return;
			}

			this.filter = '';
			this.highlightIndex = this.$root.options.pages[0] - 1;
		},
	},
	methods: {
		closeDropdown() {
			this.isOpen = false;
		},
		getCurrentPage() {
			const page = this.$root.options.pages[0] || 1;
			const canvasIndex = this.$root.options.pages[0] ? this.$root.options.pages[0] - 1 : 0;
			const label = this.$root.convertValueToArray(this.$root.canvases[canvasIndex].label)[0];
			return `${page} : ${label}`;
		},
		onKeydown(event) {
			if (this.preventKeyboardEvent(event)) {
				return;
			}

			if (event.key === 'Escape') {
				this.closeDropdown();
				return;
			}

			if (event.key === 'x') {
				this.toggleDropdown();
				event.preventDefault();
			}
		},
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
		setPage(page) {
			this.closeDropdown();
			this.$root.setPage(page);
			if (this.$root.isMobile()) {
				this.$root.updateOptions({ view: 'scan' });
			}
		},
		toggleDropdown() {
			this.isOpen = !this.isOpen;
			if (this.isOpen) {
				this.$nextTick(() => {
					this.$refs.search.focus();
					this.updateScroll();
				});
			}
		},
		updateFilteredCanvases() {
			const filteredCanvases = [];
			const filter = this.filter.toLowerCase();
			let highlightIndex = -1;
			this.$root.canvases.forEach((canvas, index) => {
				const label = this.$root.convertValueToArray(canvas.label)[0];
				const labelMatchesFilter = label.toLowerCase().indexOf(filter) > -1;
				const pageMatchesFilter = (index + 1).toFixed().indexOf(filter) > -1;
				if (labelMatchesFilter || pageMatchesFilter) {
					const item = canvas;
					item.page = index + 1;
					if (item.page === this.$root.options.pages[0]) {
						highlightIndex = filteredCanvases.length;
					}

					filteredCanvases.push(item);
				}
			});
			this.highlightIndex = (highlightIndex < 0 ? 0 : highlightIndex);
			this.filteredCanvases = filteredCanvases;
		},
		updateScroll() {
			const { list } = this.$refs;
			if (list && list.children[this.highlightIndex]) {
				const { offsetTop } = list.children[this.highlightIndex];
				list.scrollTop = offsetTop - ((list.offsetHeight / 2) - list.children[0].offsetHeight);
			}
		},
	},
	mounted() {
		this.updateFilteredCanvases();
		this.$root.$el.addEventListener('keydown', this.onKeydown);
	},
	beforeDestroy() {
		this.$root.$el.removeEventListener('keydown', this.onKeydown);
	},
};
</script>
