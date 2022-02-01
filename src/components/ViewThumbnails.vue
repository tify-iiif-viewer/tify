<template>
	<section class="tify-thumbnails" tabindex="0" @scroll="redrawThumbnails">
		<h2 class="tify-sr-only">{{ $root.translate('Pages') }}</h2>

		<div class="tify-thumbnails-list" ref="container">
			<a
				v-for="item in items"
				class="tify-thumbnails-item"
				:class="{ '-current': $root.options.pages.indexOf(item.page) > -1 }"
				href="javascript:;"
				:key="item.page"
				@click.prevent="setPageAndSwitchView(item.page, $event.ctrlKey)"
				@touchstart="touchStartTogglePage(item.page)"
				@touchend="touchEnd"
			>
				<img alt="" :src="item.imgUrl">
				<span class="tify-thumbnails-page">
					{{ $root.getPageLabel(item.page, item.label) }}
				</span>
			</a>
		</div>
	</section>
</template>

<script>
import scroll from '../mixins/scroll';

const longTouchDuration = 750;

export default {
	mixins: [
		scroll,
	],
	data() {
		return {
			isInited: false,
			itemHeight: 0,
			itemVMargin: 0,
			items: [{ label: '' }], // Dummy thumbnail to get dimensions
			itemsPerRow: 0,
			knownImages: [],
			lastScrollTop: 0,
			resizeTimeout: null,
			style: {},
			thumbnailWidth: 0,
			touchTimeout: null,
		};
	},
	watch: {
		// eslint-disable-next-line func-names
		'$root.options.pages': function (pages) {
			this.$nextTick(() => {
				const currentSelector = '.tify-thumbnails-item.-current';
				if (pages.length > 2 || (pages.length > 1 && pages[1] !== pages[0] + 1)) {
					return;
				}

				if (this.$refs.container.querySelector(currentSelector)) {
					// Current page is partitially visible
					this.updateScrollPos(currentSelector);
				} else {
					this.scrollToCurrentPage();
				}
			});
		},
		// eslint-disable-next-line func-names
		'$root.options.view': function (view) {
			if (view === 'thumbnails') {
				this.init();
			}
		},
	},
	methods: {
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
				if (this.$root.options.view !== 'thumbnails') {
					return;
				}

				this.updateDimensions();
			}, 200);
		},
		updateDimensions() {
			const itemTemplate = this.$refs.container.querySelector('.tify-thumbnails-item');
			const itemStyle = itemTemplate.currentStyle || window.getComputedStyle(itemTemplate);
			const vMargin = parseInt(itemStyle.marginTop, 10) + parseFloat(itemStyle.marginBottom, 10);
			this.itemHeight = itemTemplate.offsetHeight + vMargin;
			this.itemVMargin = vMargin;

			const hMargin = parseInt(itemStyle.marginLeft, 10) + parseFloat(itemStyle.marginRight, 10);
			const itemWidth = itemTemplate.offsetWidth + hMargin;
			this.thumbnailWidth = itemTemplate.offsetWidth;
			this.itemsPerRow = Math.floor(this.$refs.container.clientWidth / itemWidth);

			const totalRows = Math.ceil(this.$root.canvases.length / this.itemsPerRow);
			const containerHeight = (totalRows * this.itemHeight);
			this.$refs.container.style.height = `${containerHeight}px`;

			this.redrawThumbnails();

			this.scrollToCurrentPage(false);
		},
		redrawThumbnails() {
			const currentPos = this.$el.scrollTop;
			const startPage = (Math.floor(currentPos / this.itemHeight) * this.itemsPerRow) + 1;
			const visibleRowsCount = Math.ceil(this.$el.offsetHeight / this.itemHeight);
			const visiblePagesCount = visibleRowsCount * this.itemsPerRow;
			const lastPage = startPage + this.itemsPerRow + visiblePagesCount;
			const endPage = Math.min(this.$root.canvases.length, lastPage);

			const items = [];
			for (let i = startPage - 1; i < endPage; i += 1) {
				const { resource } = this.$root.canvases[i].images[0];
				if (resource.service) {
					const quality = (
						resource.service['@context'] === 'http://iiif.io/api/image/2/context.json'
							? 'default'
							: 'native'
					);
					const id = resource.service['@id'];
					items.push({
						label: this.$root.convertValueToArray(this.$root.canvases[i].label)[0],
						imgUrl: `${id}${id.slice(-1) === '/' ? '' : '/'}full/${this.thumbnailWidth},/0/${quality}.jpg`,
						page: i + 1,
					});
				} else {
					items.push({
						label: this.$root.convertValueToArray(this.$root.canvases[i].label)[0],
						imgUrl: resource['@id'],
						page: i + 1,
					});
				}
			}
			this.items = items;

			this.$nextTick(() => {
				const rowsBefore = Math.floor(startPage / this.itemsPerRow);
				this.$refs.container.style.paddingTop = `${(rowsBefore * this.itemHeight)}px`;
			});
		},
		scrollToCurrentPage(animated = true) {
			const rowsBefore = Math.floor((this.$root.options.pages[0] - 1) / this.itemsPerRow);
			const scrollPos = (rowsBefore * this.itemHeight) + (this.itemVMargin - 50);
			if (animated) {
				this.scrollTo(this.$el, scrollPos);
			} else {
				this.$el.scrollTop = scrollPos;
			}
		},
		setPageAndSwitchView(page, multiple = false) {
			if (multiple) {
				// Using slice to get a clone instead of a reference
				const pages = this.$root.options.pages.slice(0);
				const index = pages.indexOf(page);
				if (index < 0) {
					// Page is not yet visible
					pages.push(page);
					pages.sort((a, b) => (a - b));

					// Double-page view was active, remove dummy "0" page
					if (pages[0] === 0) {
						pages.shift();
					}
				} else if (pages.length > 1) {
					// Page is visible, but not the only visible page
					pages.splice(index, 1);
				}

				this.$root.updateOptions({ pages });
				return;
			}

			this.$root.setPage(page);
			if (this.$root.isMobile()) {
				this.$root.updateOptions({ view: 'scan' });
			}
		},
		touchStartTogglePage(page) {
			this.lastScrollTop = this.$el.scrollTop;
			this.touchTimeout = setTimeout(
				() => {
					if (this.$el.scrollTop === this.lastScrollTop) {
						this.setPageAndSwitchView(page, true);
					}
				},
				longTouchDuration,
			);
		},
		touchEnd() {
			clearTimeout(this.touchTimeout);
		},
	},
	mounted() {
		this.style.flex = this.$el.style.flex;

		// Thumbnails are expensive, so render them only when required
		if (this.$root.options.view === 'thumbnails') {
			this.init();
		}
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.onResize);
	},
};
</script>
