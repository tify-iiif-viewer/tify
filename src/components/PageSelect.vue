<script>
import vClickOutside from 'click-outside-vue3';

import { preventEvent } from '../modules/keyboard';

export default {
	directives: {
		clickOutside: vClickOutside.directive,
	},
	data() {
		return {
			filter: '',
			filteredCanvases: [],
			highlightIndex: 0,
			isOpen: false,
		};
	},
	computed: {
		currentPageLabel() {
			const page = this.$store.options.pages[0] || 1;
			const canvasIndex = this.$store.options.pages[0] ? this.$store.options.pages[0] - 1 : 0;
			const label = this.$store.localize(this.$store.manifest.items[canvasIndex].label);
			return this.$store.getPageLabel(page, label);
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
			this.highlightIndex = this.$store.options.pages[0] - 1;
		},
	},
	mounted() {
		this.updateFilteredCanvases();
		this.$store.rootElement.addEventListener('keydown', this.onKeydown);
	},
	beforeUnmount() {
		this.$store.rootElement.removeEventListener('keydown', this.onKeydown);
	},
	methods: {
		closeDropdown() {
			this.isOpen = false;
		},
		onKeydown(event) {
			if (preventEvent(event)) {
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
			this.$store.setPage(page);
			if (this.$store.isMobile()) {
				this.$store.updateOptions({ view: null });
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
			if (list && list.children[this.highlightIndex]) {
				const { offsetTop } = list.children[this.highlightIndex];
				list.scrollTop = offsetTop - ((list.offsetHeight / 2) - list.children[0].offsetHeight);
			}
		},
	},
};
</script>

<template>
	<div
		v-click-outside="closeDropdown"
		class="tify-page-select"
	>
		<button
			type="button"
			class="tify-page-select-button"
			:aria-controls="$store.getId('dropdown')"
			:aria-expanded="isOpen"
			@click="toggleDropdown()"
		>
			<span class="tify-sr-only">{{ $translate('Current page:') }}</span>
			{{ currentPageLabel }}
			<span class="tify-sr-only">/ {{ $translate('Toggle page select') }}</span>
		</button>

		<div
			v-show="isOpen"
			:id="$store.getId('dropdown')"
			key="dropdown"
			class="tify-page-select-dropdown"
			@click.stop
		>
			<div class="tify-page-select-filter">
				<input
					ref="search"
					v-model="filter"
					:aria-label="$translate('Filter pages')"
					type="text"
					class="tify-page-select-input"
					@keyup.enter="filteredCanvases[highlightIndex] && $store.setPage(filteredCanvases[highlightIndex].page)"
					@keydown.esc.prevent="filter ? (filter = '') : closeDropdown()"
					@keydown.up.prevent="onKeyUpArrow()"
					@keydown.down.prevent="onKeyDownArrow()"
				/>
			</div>
			<ol
				ref="list"
				class="tify-page-select-list"
			>
				<li
					v-for="(canvas, index) in filteredCanvases"
					:key="index"
					:class="{
						'-current': $store.options.pages.includes(canvas.page),
						'-highlighted': highlightIndex === index,
					}"
				>
					<a
						href="javascript:;"
						@click="setPage(canvas.page)"
					>
						{{ $store.getPageLabel(canvas.page, $store.localize(canvas.label)) }}
					</a>
				</li>
			</ol>
		</div>
	</div>
</template>
