<template>
	<div class="tify-page-select">
		<button
			class="tify-page-select_button"
			:title="pageTitleAttr"
			v-click-outside="closeDropdown"
			@click="toggleDropdown"
		>
			<span class="tify-sr-only">{{ 'Current page'|trans }}</span>
			{{ getCurrentPage() }}
		</button>

		<div
			class="tify-page-select_dropdown"
			key="dropdown"
			v-show="isOpen"
			@click.stop
		>
			<div class="tify-page-select_filter">
				<label class="tify-sr-only">{{'Filter pages'}}</label>
				<input
					type="text"
					class="tify-page-select_input"
					ref="search"
					v-model="filter"
					@keyup.enter="(filteredCanvases[highlightIndex]) && setPage(filteredCanvases[highlightIndex].page)"
					@keydown.esc.prevent="filter ? filter = '' : closeDropdown()"
					@keydown.up.prevent="(highlightIndex > 0) && (highlightIndex -= 1)"
					@keydown.down.prevent="(highlightIndex < filteredCanvases.length - 1) && (highlightIndex += 1)"
				>
			</div>
			<ol class="tify-page-select_list" ref="list">
				<li
					:key="index"
					v-for="(canvas, index) in filteredCanvases"
					:class="{
						'-current': $root.params.pages.indexOf(canvas.page) > -1,
						'-highlighted': highlightIndex === index,
					}"
					@click="setPage(canvas.page)"
				>
					{{ canvas.page }}
					:
					{{ getLabels(canvas.label)[0] }}
				</li>
			</ol>
		</div>
	</div>
</template>

<script>
import keyboard from '@/mixins/keyboard';

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
			const { pages } = this.$root.params;
			const page = (pages[0] === 0 && pages.length > 1 ? 1 : pages[0]);
			const physLabel = this.$options.filters.trans('Physical page');
			const logLabel = this.$options.filters.trans('Logical page');
			return `${physLabel}: ${page}\n`
					+ `${logLabel}: ${this.$root.convertValueToArray(this.$root.canvases[page - 1].label)[0]}`;
		},
	},
	watch: {
		filter() {
			this.updateFilteredCanvases();
		},
		highlightIndex() {
			this.$nextTick(() => this.updateScroll());
		},
		isOpen() {
			if (this.isOpen) return;

			this.filter = '';
			this.highlightIndex = this.$root.params.pages[0] - 1;
		},
	},
	methods: {
		setPage(page) {
			this.closeDropdown();
			this.$root.setPage(page);
			if (this.$root.isMobile()) this.$root.updateParams({ view: 'scan' });
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
		closeDropdown() {
			this.isOpen = false;
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
					if (item.page === this.$root.params.pages[0]) highlightIndex = filteredCanvases.length;
					filteredCanvases.push(item);
				}
			});
			this.highlightIndex = (highlightIndex < 0 ? 0 : highlightIndex);
			this.filteredCanvases = filteredCanvases;
		},
		updateScroll() {
			const { list } = this.$refs;
			if (list.children[this.highlightIndex]) {
				const { offsetTop } = list.children[this.highlightIndex];
				list.scrollTop = offsetTop - ((list.offsetHeight / 2) - list.children[0].offsetHeight);
			}
		},
		getLabels(value) {
			return this.$root.convertValueToArray(value);
		},
		getCurrentPage() {
			const page = this.$root.params.pages[0] || 1;
			const canvasIndex = this.$root.params.pages[0] ? this.$root.params.pages[0] - 1 : 0;
			const label = this.getLabels(this.$root.canvases[canvasIndex].label)[0];
			return `${page} : ${label}`;
		},
	},
	mounted() {
		this.updateFilteredCanvases();

		window.addEventListener('keydown', (event) => {
			if (this.preventKeyboardEvent(event)) return;

			if (event.key === 'Escape') {
				this.closeDropdown();
				return;
			}

			if (event.key === 'x') {
				this.toggleDropdown();
				event.preventDefault();
			}
		});
	},
};
</script>
