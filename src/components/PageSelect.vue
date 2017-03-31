<template>
	<button
		class="tify-page-select"
		:title="pageTitleAttr"
		v-click-outside="closeDropdown"
		@click="toggleDropdown"
	>
		<span class="tify-sr-only">{{ 'Current page'|trans }}</span>
		{{ page }} : {{ canvases[page - 1].label }}

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
					@keyup.stop
				>
			</div>
			<ol class="tify-page-select_list" ref="list">
				<li
					v-for="canvas, index in filteredCanvases"
					:class="{ '-current': page === canvas.page, '-highlighted': highlightIndex === index }"
					@click="setPage(canvas.page)"
				>
					{{ canvas.page }} : {{ canvas.label }}
				</li>
			</ol>
		</div>
	</button>
</template>

<script>
	export default {
		props: [
			'canvases',
			'page',
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
				const phys = this.$options.filters.trans('Physical page');
				const log = this.$options.filters.trans('Logical page');
				return `${phys}: ${this.page}\n${log}: ${this.canvases[this.page - 1].label}`;
			},
		},
		watch: {
			filter() {
				this.updateFilteredCanvases();
			},
			highlightIndex() {
				this.$nextTick(() => this.updateScroll());
			},
			page() {
				this.highlightIndex = this.page - 1;
			},
		},
		methods: {
			setPage(page) {
				this.closeDropdown();
				this.$emit('setPage', page);
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
				let highlightIndex = -1;
				this.canvases.forEach((canvas, index) => {
					if (canvas.label.toLowerCase().indexOf(this.filter.toLowerCase()) > -1
							|| (index + 1).toFixed().indexOf(this.filter) > -1) {
						const item = canvas;
						item.page = index + 1;
						if (item.page === this.page) highlightIndex = filteredCanvases.length;
						filteredCanvases.push(item);
					}
				});
				this.highlightIndex = (highlightIndex < 0 ? 0 : highlightIndex);
				this.filteredCanvases = filteredCanvases;
			},
			updateScroll() {
				const list = this.$refs.list;
				if (list.children.length > 0) {
					const offsetTop = list.children[this.highlightIndex].offsetTop;
					list.scrollTop = offsetTop - ((list.offsetHeight / 2) - list.children[0].offsetHeight);
				}
			},
		},
		created() {
			this.updateFilteredCanvases();
		},
		updated() {
			// TODO: This is a horrible hack to prevent blurry rendering of the
			// CSS-translated dropdown in Chrome
			const dropdown = this.$el.querySelector('.tify-page-select_dropdown');
			dropdown.style.width = '';
			dropdown.style.width = dropdown.offsetWidth % 2 ? `${dropdown.offsetWidth + 1}px` : '';
		},
	};
</script>
