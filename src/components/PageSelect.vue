<template>
	<div class="tify-page-select">
		<button
			v-click-outside="closeDropdown"
			type="button"
			class="tify-page-select-button"
			:title="currentPageTitleAttr"
			:aria-label="translate('Current page')"
			:aria-controls="getId('dropdown')"
			:aria-expanded="isOpen ? 'true' : 'false'"
			@click="toggleDropdown"
		>
			{{ currentPageLabel }}
		</button>

		<div
			v-show="isOpen"
			:id="getId('dropdown')"
			key="dropdown"
			class="tify-page-select-dropdown"
			@click.stop
		>
			<div class="tify-page-select-filter">
				<input
					ref="search"
					v-model="filter"
					:aria-label="translate('Filter pages')"
					type="text"
					class="tify-page-select-input"
					@keyup.enter="filteredCanvases[highlightIndex] && setPage(filteredCanvases[highlightIndex].page)"
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
						'-current': options.pages.indexOf(canvas.page) > -1,
						'-highlighted': highlightIndex === index,
					}"
				>
					<a
						href="javascript:;"
						@click="setPage(canvas.page)"
					>
						{{ getPageLabel(canvas.page, convertValueToArray(canvas.label)[0]) }}
					</a>
				</li>
			</ol>
		</div>
	</div>
</template>

<script>
import { getId } from '../modules/id';
import { translate } from '../modules/i18n';
import { convertValueToArray, getPageLabel } from '../modules/iiif';
import { preventEvent } from '../modules/keyboard';
import { setPage } from '../modules/pagination';
import { options, updateOptions, manifest } from '../modules/store';
import { isMobile } from '../modules/ui';

export default {
	data() {
		return {
			filter: '',
			filteredCanvases: [],
			highlightIndex: 0,
			isOpen: false,
			options,
		};
	},
	computed: {
		canvases() {
			return manifest.sequences[0].canvases || [];
		},
		currentPageLabel() {
			const page = options.pages[0] || 1;
			const canvasIndex = options.pages[0] ? options.pages[0] - 1 : 0;
			const label = convertValueToArray(this.canvases[canvasIndex].label)[0];
			return getPageLabel(page, label);
		},
		currentPageTitleAttr() {
			const { pages } = options;
			const page = pages[0] === 0 && pages.length > 1
				? 1
				: pages[0];
			const physLabel = translate('Physical page');
			const logLabel = translate('Logical page');
			return `${physLabel}: ${page}\n`
				+ `${logLabel}: ${convertValueToArray(this.canvases[page - 1].label)[0]}`;
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
			this.highlightIndex = options.pages[0] - 1;
		},
	},
	mounted() {
		this.updateFilteredCanvases();
		options.root.$el.addEventListener('keydown', this.onKeydown);
	},
	beforeUnmount() {
		options.root.$el.removeEventListener('keydown', this.onKeydown);
	},
	methods: {
		closeDropdown() {
			this.isOpen = false;
		},
		convertValueToArray,
		getId,
		getPageLabel,
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
			setPage(page);
			if (isMobile()) {
				updateOptions({ view: 'scan' });
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
			this.canvases.forEach((canvas, index) => {
				const label = convertValueToArray(canvas.label)[0];
				const labelMatchesFilter = label.toLowerCase().indexOf(filter) > -1;
				const pageMatchesFilter = (index + 1).toFixed().indexOf(filter) > -1;
				if (labelMatchesFilter || pageMatchesFilter) {
					const item = canvas;
					item.page = index + 1;
					if (item.page === options.pages[0]) {
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
		translate,
	},
};
</script>
