<template>
	<section class="tify-thumbnails" @scroll="redrawThumbnails">
		<h2 class="tify-sr-only">{{ 'Pages'|trans }}</h2>

		<div class="tify-thumbnails_list">
			<a
				v-for="item in items"
				class="tify-thumbnails_item"
				href=""
				:class="{ '-current': $root.params.pages.indexOf(item.page) > -1 }"
				:key="item.page"
				@click.prevent="setPageAndSwitchView(item.page, $event.ctrlKey)"
				@touchstart="touchStartTogglePage(item.page)"
				@touchend="touchEnd"
			>
				<img alt="" :src="item.imgUrl">
				<span class="tify-thumbnails_page-number">
					{{ item.page }} : {{ item.label }}
				</span>
			</a>
		</div>
	</section>
</template>

<script>
	import scroll from '@/mixins/scroll';

	const longTouchDuration = 750;

	export default {
		mixins: [
			scroll,
		],
		data() {
			return {
				container: null,
				isInited: false,
				itemHeight: 0,
				itemVMargin: 0,
				itemWidth: 0,
				items: [{ label: '' }], // Dummy thumbnail to get dimensions
				itemsPerRow: 0,
				knownImages: [],
				lastScrollTop: 0,
				style: {},
				thumbnailWidth: 0,
				touchTimer: null,
			};
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function (pages) {
				this.$nextTick(() => {
					const currentSelector = '.tify-thumbnails_item.-current';
					if (pages.length > 2 || (pages.length > 1 && pages[1] !== pages[0] + 1)) {
						return;
					}

					if (document.querySelector(currentSelector)) {
						// Current page is partitially visible
						this.updateScrollPos(currentSelector);
					} else {
						this.scrollToCurrentPage();
					}
				});
			},
			// eslint-disable-next-line func-names
			'$root.params.view': function (view) {
				if (view === 'thumbnails') {
					if (!this.isInited) this.init();
					this.scrollToCurrentPage(false);
				}
			},
		},
		methods: {
			determineDimensions() {
				this.container = this.$el.querySelector('.tify-thumbnails_list');

				const itemTemplate = this.container.querySelector('.tify-thumbnails_item');
				const itemStyle = itemTemplate.currentStyle || window.getComputedStyle(itemTemplate);
				const vMargin = parseInt(itemStyle.marginTop, 10) + parseFloat(itemStyle.marginBottom, 10);
				this.itemHeight = itemTemplate.offsetHeight + vMargin;
				this.itemVMargin = vMargin;
				const hMargin = parseInt(itemStyle.marginLeft, 10) + parseFloat(itemStyle.marginRight, 10);
				this.itemWidth = itemTemplate.offsetWidth + hMargin;
				this.thumbnailWidth = itemTemplate.offsetWidth;

				this.$el.style.flex = this.style.flex;
				this.container.style.width = '';

				this.itemsPerRow = Math.floor((this.container.clientWidth) / this.itemWidth);
				const totalRows = Math.ceil(this.$root.canvases.length / this.itemsPerRow);
				const containerHeight = (totalRows * this.itemHeight);

				this.$el.style.flex = 'none';
				this.container.style.height = `${containerHeight}px`;
				this.container.style.width = `${this.itemsPerRow * this.itemWidth}px`;

				this.redrawThumbnails();
			},
			init() {
				this.determineDimensions();

				// Redraw thumbnails when the window is resized
				let resizeTimeout;
				window.addEventListener('resize', () => {
					clearTimeout(resizeTimeout);
					resizeTimeout = setTimeout(() => {
						if (this.$root.params.view !== 'thumbnails') {
							this.isInited = false;
							return;
						}

						this.init();
						this.scrollToCurrentPage(false);
					}, 250);
				});

				this.isInited = true;
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
							label: this.$root.iiifConvertToArray(this.$root.canvases[i].label)[0],
							imgUrl: `${id}${id.slice(-1) === '/' ? '' : '/'}full/${this.thumbnailWidth},/0/${quality}.jpg`,
							page: i + 1,
						});
					} else {
						items.push({
							label: this.$root.iiifConvertToArray(this.$root.canvases[i].label)[0],
							imgUrl: resource['@id'],
							page: i + 1,
						});
					}
				}
				this.items = items;

				this.$nextTick(() => {
					const rowsBefore = Math.floor(startPage / this.itemsPerRow);
					this.container.style.paddingTop = `${(rowsBefore * this.itemHeight)}px`;
				});
			},
			scrollToCurrentPage(animated = true) {
				const rowsBefore = Math.floor((this.$root.params.pages[0] - 1) / this.itemsPerRow);
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
					const pages = this.$root.params.pages.slice(0);
					const index = pages.indexOf(page);
					if (index < 0) {
						pages.push(page);
						pages.sort((a, b) => (a - b));
					} else if (pages.length > 1) {
						pages.splice(index, 1);
					}
					this.$root.updateParams({ pages });
					return;
				}

				this.$root.setPage(page);
				if (this.$root.isMobile()) this.$root.updateParams({ view: 'scan' });
			},
			touchStartTogglePage(page) {
				this.lastScrollTop = this.$el.scrollTop;
				this.touchTimer = setTimeout(
					() => {
						if (this.$el.scrollTop === this.lastScrollTop) {
							this.setPageAndSwitchView(page, true);
						}
					},
					longTouchDuration,
				);
			},
			touchEnd() {
				clearTimeout(this.touchTimer);
			},
		},
		mounted() {
			this.style.flex = this.$el.style.flex;

			// Thumbnails are expensive, so render them only when required
			if (this.$root.params.view === 'thumbnails') {
				this.init();
				this.scrollToCurrentPage(false);
			}
		},
	};
</script>
