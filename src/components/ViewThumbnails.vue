<script>
import { scrollTo, updateScrollPos } from '../modules/scroll';

const longTouchDuration = 750;

export default {
	data() {
		return {
			itemHeight: 0,
			itemVMargin: 0,
			items: [{ label: '' }], // Dummy thumbnail to get dimensions
			itemsPerRow: 0,
			knownImages: [],
			lastScrollTop: 0,
			resizeObserver: null,
			resizeTimeout: null,
			style: {},
			thumbnailWidth: 0,
			touchTimeout: null,
		};
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.pages': function (pages) {
			this.$nextTick(() => {
				const currentSelector = '.tify-thumbnails-item.-current';
				if (pages.length > 2 || (pages.length > 1 && pages[1] !== pages[0] + 1)) {
					return;
				}

				if (this.$refs.container.querySelector(currentSelector)) {
					// Current page is partitially visible
					updateScrollPos(currentSelector, this.$el);
				} else {
					this.scrollToCurrentPage();
				}
			});
		},
		'$store.options.view': {
			handler(view) {
				if (view === 'thumbnails') {
					this.$nextTick(this.init);
				}
			},
			immediate: true,
		},
	},
	mounted() {
		this.style.flex = this.$el.style.flex;
	},
	unmounted() {
		this.resizeObserver?.disconnect();
		clearTimeout(this.resizeTimeout);
	},
	methods: {
		init() {
			this.updateDimensions();
			this.scrollToCurrentPage(false);

			this.resizeObserver = new ResizeObserver(this.onResize);
			this.resizeObserver.observe(this.$el);
		},
		onResize() {
			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(() => {
				if (this.$store.options.view !== 'thumbnails') {
					return;
				}

				this.updateDimensions();
			}, 200);
		},
		updateDimensions() {
			const itemTemplate = this.$refs.container.querySelector('.tify-thumbnails-item');
			const itemStyle = itemTemplate.currentStyle || window.getComputedStyle(itemTemplate);
			const verticalMargin = parseInt(itemStyle.marginTop, 10) + parseFloat(itemStyle.marginBottom, 10);
			this.itemHeight = itemTemplate.offsetHeight + verticalMargin;
			this.itemVerticalMargin = verticalMargin;

			const horizontalMargin = parseInt(itemStyle.marginLeft, 10) + parseFloat(itemStyle.marginRight, 10);
			const itemWidth = itemTemplate.offsetWidth + horizontalMargin;
			this.thumbnailWidth = itemTemplate.offsetWidth;
			this.itemsPerRow = Math.floor(this.$refs.container.clientWidth / itemWidth);

			const totalRows = Math.ceil(this.$store.manifest.items.length / this.itemsPerRow);
			const containerHeight = totalRows * this.itemHeight;
			this.$refs.container.style.height = `${containerHeight}px`;

			this.redrawThumbnails();

			this.scrollToCurrentPage(false);
		},
		redrawThumbnails() {
			const currentPos = this.$el.scrollTop;
			const startPage = Math.floor(currentPos / this.itemHeight) * this.itemsPerRow + 1;
			const visibleRowsCount = Math.ceil(this.$el.offsetHeight / this.itemHeight);
			const visiblePagesCount = visibleRowsCount * this.itemsPerRow;
			const lastPage = startPage + this.itemsPerRow + visiblePagesCount;
			const endPage = Math.min(this.$store.manifest.items.length, lastPage);

			const items = [];
			for (let i = startPage - 1; i < endPage; i += 1) {
				const resource = this.$store.manifest.items[i].items[0].items[0].body;
				if (resource.service) {
					const service = resource.service instanceof Array ? resource.service[0] : resource.service;
					const quality = ['ImageService2', 'ImageService3'].includes(service.type || service['@type'])
						? 'default'
						: 'native';
					const id = service.id || service['@id'];
					items.push({
						label: this.$store.localize(this.$store.manifest.items[i].label),
						imgUrl: `${id}${id.at(-1) === '/' ? '' : '/'}full/${this.thumbnailWidth},/0/${quality}.jpg`,
						page: i + 1,
					});
				} else {
					items.push({
						label: this.$store.localize(this.$store.manifest.items[i].label),
						imgUrl: resource.id,
						page: i + 1,
					});
				}
			}

			this.items = items;

			this.$nextTick(() => {
				const rowsBefore = Math.floor(startPage / this.itemsPerRow);
				this.$refs.container.style.paddingTop = `${rowsBefore * this.itemHeight}px`;
			});
		},
		scrollToCurrentPage(animated = true) {
			const rowsBefore = Math.floor((this.$store.options.pages[0] - 1) / this.itemsPerRow);
			const scrollPos = (rowsBefore * this.itemHeight) + (this.itemVMargin - 50);
			if (animated) {
				scrollTo(this.$el, scrollPos);
			} else {
				this.$el.scrollTop = scrollPos;
			}
		},
		setPageAndSwitchView(page, multiple = false) {
			if (multiple) {
				// Using slice to get a clone instead of a reference
				const pages = this.$store.options.pages.slice(0);
				const index = pages.indexOf(page);
				if (index < 0) {
					// Page is not yet visible
					pages.push(page);
					pages.sort((a, b) => a - b);

					// Double-page view was active, remove dummy "0" page
					if (pages[0] === 0) {
						pages.shift();
					}
				} else if (pages.length > 1) {
					// Page is visible, but not the only visible page
					pages.splice(index, 1);
				}

				this.$store.updateOptions({ pages });
				return;
			}

			this.$store.setPage(page);
			if (this.$store.isMobile()) {
				this.$store.updateOptions({ view: null });
			}
		},
		touchStartTogglePage(page) {
			this.lastScrollTop = this.$el.scrollTop;
			this.touchTimeout = setTimeout(() => {
				if (this.$el.scrollTop === this.lastScrollTop) {
					this.setPageAndSwitchView(page, true);
				}
			}, longTouchDuration);
		},
		touchEnd() {
			clearTimeout(this.touchTimeout);
		},
	},
};
</script>

<template>
	<section
		class="tify-thumbnails"
		tabindex="0"
		@scroll="redrawThumbnails"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Pages') }}
		</h2>

		<div
			ref="container"
			class="tify-thumbnails-list"
		>
			<a
				v-for="item in items"
				:key="item.page"
				class="tify-thumbnails-item"
				:class="{ '-current': $store.options.pages.includes(item.page) }"
				href="javascript:;"
				@click.prevent="setPageAndSwitchView(item.page, $event.ctrlKey)"
				@touchstart="touchStartTogglePage(item.page)"
				@touchend="touchEnd"
			>
				<img
					alt=""
					:src="item.imgUrl || 'data:,'"
				/>
				<span class="tify-thumbnails-page">
					{{ $store.getPageLabel(item.page, item.label) }}
				</span>
			</a>
		</div>
	</section>
</template>
