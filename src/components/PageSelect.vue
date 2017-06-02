<template>
	<div class="tify-page-select">
		<button
			class="tify-page-select_button"
			:title="pageTitleAttr"
			v-click-outside="closeDropdown"
			@click="toggleDropdown"
		>
			<span class="tify-sr-only">{{ 'Current page'|trans }}</span>
			{{ $root.params.page }} : {{ $root.canvases[$root.params.page - 1].label }}
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
					@keyup.esc="filter ? filter = '' : isOpen = false"
					@keydown.up="(highlightIndex > 0) && (highlightIndex -= 1)"
					@keydown.down="(highlightIndex < filteredCanvases.length - 1) && (highlightIndex += 1)"
				>
			</div>
			<ol class="tify-page-select_list" ref="list">
				<li
					v-for="canvas, index in filteredCanvases"
					:class="{ '-current': $root.params.page === canvas.page, '-highlighted': highlightIndex === index }"
					@click="setPage(canvas.page)"
				>
					{{ canvas.page }} : {{ canvas.label }}
				</li>
			</ol>
		</div>
	</div>
</template>

<script>
	export default {
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
				const phys = this.$options.filters.trans('Physical page');
				const log = this.$options.filters.trans('Logical page');
				return `${phys}: ${this.$root.params.page}\n${log}: ${this.$root.canvases[this.$root.params.page - 1].label}`;
			},
		},
		watch: {
			filter() {
				this.updateFilteredCanvases();
			},
			highlightIndex() {
				this.$nextTick(() => this.updateScroll());
			},
		},
		methods: {
			setPage(page) {
				this.closeDropdown();
				this.$root.setPage(page);
			},
			toggleDropdown() {
				this.isOpen = !this.isOpen;
				if (this.isOpen) {
					this.$nextTick(() => {
						if (this.$refs.search) this.$refs.search.focus();
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
					const labelMatchesFilter = canvas.label.toLowerCase().indexOf(filter) > -1;
					const pageMatchesFilter = (index + 1).toFixed().indexOf(filter) > -1;
					if (labelMatchesFilter || pageMatchesFilter) {
						const item = canvas;
						item.page = index + 1;
						if (item.page === this.$root.params.page) highlightIndex = filteredCanvases.length;
						filteredCanvases.push(item);
					}
				});
				this.highlightIndex = (highlightIndex < 0 ? 0 : highlightIndex);
				this.filteredCanvases = filteredCanvases;
			},
			updateScroll() {
				const list = this.$refs.list;
				if (list.children[this.highlightIndex]) {
					const offsetTop = list.children[this.highlightIndex].offsetTop;
					list.scrollTop = offsetTop - ((list.offsetHeight / 2) - list.children[0].offsetHeight);
				}
			},
		},
		created() {
			this.updateFilteredCanvases();
		},
	};
</script>
