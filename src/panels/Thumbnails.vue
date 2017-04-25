<template>
	<section
		class="tify-thumbnails"
		@scroll="redrawThumbnails"
	>
		<h2 class="tify-sr-only">{{ 'Pages'|trans }}</h2>

		<div
			class="tify-thumbnails_list"
		>
			<a
				v-for="item in items"
				class="tify-thumbnails_item"
				:class="{ '-current': item.page === page }"
				:key="item.page"
				@click="$emit('setPage', item.page)"
			>
				<img :src="item.imgUrl">
				<span class="tify-thumbnails_page-number">
					{{ item.page }} : {{ item.label }}
				</span>
			</a>
		</div>
	</section>
</template>

<script>
	import animatedScroll from '@/mixins/animated-scroll';

	export default {
		props: [
			'apiVersion',
			'canvases',
			'page',
		],
		mixins: [
			animatedScroll,
		],
		data() {
			return {
				container: null,
				isInited: false,
				itemHeight: 0,
				itemWidth: 0,
				items: [{ label: '' }], // Dummy thumbnail to get dimensions
				itemsPerRow: 0,
				knownImages: [],
				style: {},
				thumbnailWidth: 0,
			};
		},
		watch: {
			page() {
				this.scrollToCurrentPage();
			},
		},
		methods: {
			init() {
				this.container = this.$el.querySelector('.tify-thumbnails_list');

				const itemTemplate = this.container.querySelector('.tify-thumbnails_item');
				const itemStyle = itemTemplate.currentStyle || window.getComputedStyle(itemTemplate);
				const hMargin = parseInt(itemStyle.marginLeft, 10) + parseFloat(itemStyle.marginRight, 10);
				const vMargin = parseInt(itemStyle.marginTop, 10) + parseFloat(itemStyle.marginBottom, 10);
				this.itemHeight = itemTemplate.offsetHeight + hMargin;
				this.itemWidth = itemTemplate.offsetWidth + vMargin;
				this.thumbnailWidth = itemTemplate.offsetWidth;

				this.$el.style = this.style;
				this.container.style.width = '';

				this.itemsPerRow = Math.floor((this.container.clientWidth) / this.itemWidth);
				const totalRows = Math.ceil(this.canvases.length / this.itemsPerRow);
				const containerHeight = (totalRows * this.itemHeight);

				this.$el.style.flex = 'none';
				this.container.style.height = `${containerHeight}px`;
				this.container.style.width = `${this.itemsPerRow * this.itemWidth}px`;

				this.redrawThumbnails();
				this.scrollToCurrentPage(false);
			},
			redrawThumbnails() {
				const currentPos = this.$el.scrollTop;
				const startPage = (Math.floor(currentPos / this.itemHeight) * this.itemsPerRow) + 1;
				const visibleRowsCount = Math.ceil(this.$el.offsetHeight / this.itemHeight);
				const visiblePagesCount = visibleRowsCount * this.itemsPerRow;
				const lastPage = startPage + this.itemsPerRow + visiblePagesCount;
				const endPage = Math.min(this.canvases.length, lastPage);

				const rowsBefore = Math.floor(startPage / this.itemsPerRow);
				this.container.style.paddingTop = `${(rowsBefore * this.itemHeight)}px`;

				this.items = [];
				for (let i = startPage - 1; i < endPage; i += 1) {
					const id = this.canvases[i].images[0].resource.service['@id'];
					const quality = (this.apiVersion === 1 ? 'native' : 'default');
					this.items.push({
						label: this.canvases[i].label,
						imgUrl: `${id}/full/${this.thumbnailWidth},/0/${quality}.jpg`,
						page: i + 1,
					});
				}
			},
			scrollToCurrentPage(animated = true) {
				const rowsBefore = Math.floor((this.page - 1) / this.itemsPerRow);
				const scrollPos = (rowsBefore * this.itemHeight) - this.itemHeight;
				if (animated) {
					this.scrollTo(this.$el, scrollPos);
				} else {
					this.$el.scrollTop = scrollPos;
				}
			},
		},
		mounted() {
			this.style = this.$el.style;
			this.init();
			window.addEventListener('resize', this.init);
		},
	};
</script>
