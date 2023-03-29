<template>
	<section
		class="tify-thumbnails"
		tabindex="0"
		@scroll="redrawThumbnails"
	>
		<h2 class="tify-sr-only">
			{{ translate('Pages') }}
		</h2>

		<div
			ref="container"
			class="tify-thumbnails-list"
		>
			<a
				v-for="item in items"
				:key="item.page"
				class="tify-thumbnails-item"
				:class="{ '-current': options.pages.indexOf(item.page) > -1 }"
				href="javascript:;"
				@click.prevent="setPageAndSwitchView(item.page, $event.ctrlKey)"
				@touchstart="touchStartTogglePage(item.page)"
				@touchend="touchEnd"
			>
				<img
					alt=""
					:src="item.imgUrl"
				/>
				<span class="tify-thumbnails-page">
					{{ getPageLabel(item.page, item.label) }}
				</span>
			</a>
		</div>
	</section>
</template>

<script>
import { translate } from '../modules/i18n';
import { convertValueToArray, getPageLabel } from '../modules/iiif';
import { setPage } from '../modules/pagination';
import { canvases, options, updateOptions } from '../modules/store';
import { isMobile, updateScrollPos, scrollTo } from '../modules/ui';

const longTouchDuration = 750;

export default {
	data() {
		return {
			isInited: false,
			itemHeight: 0,
			itemVMargin: 0,
			items: [{ label: '' }], // Dummy thumbnail to get dimensions
			itemsPerRow: 0,
			knownImages: [],
			lastScrollTop: 0,
			options,
			resizeTimeout: null,
			style: {},
			thumbnailWidth: 0,
			touchTimeout: null,
		};
	},
	watch: {
		// eslint-disable-next-line func-names
		'options.pages': function (pages) {
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
		// eslint-disable-next-line func-names
		'options.view': {
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
	beforeUnmount() {
		window.removeEventListener('resize', this.onResize);
	},
	methods: {
		getPageLabel,
		init() {
			this.updateDimensions();
			this.scrollToCurrentPage(false);

			if (!this.isInited) {
				// Redraw thumbnails when the window is resized
				window.addEventListener('resize', this.onResize);

				this.isInited = true;
			}
		},
		onResize() {
			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(() => {
				if (options.view !== 'thumbnails') {
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

			const totalRows = Math.ceil(canvases.value.length / this.itemsPerRow);
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
			const endPage = Math.min(canvases.value.length, lastPage);

			const items = [];
			for (let i = startPage - 1; i < endPage; i += 1) {
				const { resource } = canvases.value[i].images[0];
				if (resource.service) {
					const quality = resource.service['@context'] === 'http://iiif.io/api/image/2/context.json'
						? 'default'
						: 'native';
					const id = resource.service['@id'];
					items.push({
						label: convertValueToArray(canvases.value[i].label)[0],
						imgUrl: `${id}${id.slice(-1) === '/' ? '' : '/'}full/${this.thumbnailWidth},/0/${quality}.jpg`,
						page: i + 1,
					});
				} else {
					items.push({
						label: convertValueToArray(canvases.value[i].label)[0],
						imgUrl: resource['@id'],
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
			const rowsBefore = Math.floor((options.pages[0] - 1) / this.itemsPerRow);
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
				const pages = options.pages.slice(0);
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

				updateOptions({ pages });
				return;
			}

			setPage(page);
			if (isMobile()) {
				updateOptions({ view: 'scan' });
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
		translate,
	},
};
</script>
