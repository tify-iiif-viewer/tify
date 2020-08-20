<template>
	<div class="tify-header_button-group -pagination">
		<button
				class="tify-header_button"
				:disabled="$root.$root.customPageViewActive || isFirstPage"
				:title="'First page'|trans"
				@click="goToFirstPage"
		>
			<icon name="first_page"/>
			<span class="tify-sr-only">{{ 'First page'|trans }}</span>
		</button>

		<button
				v-if="structures && structures.length"
				class="tify-header_button"
				:disabled="$root.customPageViewActive || isFirstPage"
				:title="'Previous section'|trans"
				@click="goToPreviousSection"
		>
			<icon name="skip_previous"/>
			<span class="tify-sr-only">{{ 'Previous section'|trans }}</span>
		</button>

		<button
				class="tify-header_button"
				:disabled="$root.customPageViewActive || isFirstPage"
				:title="'Previous page'|trans"
				@click="goToPreviousPage"
		>
			<icon name="navigate_before"/>
			<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
		</button>

		<button
				class="tify-header_button"
				:disabled="$root.customPageViewActive || isLastPage"
				:title="'Next page'|trans"
				@click="goToNextPage"
		>
			<icon name="navigate_next"/>
			<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
		</button>

		<button
				v-if="structures && structures.length"
				class="tify-header_button"
				:disabled="$root.customPageViewActive || isLastSection"
				:title="'Next section'|trans"
				@click="goToNextSection"
		>
			<icon name="skip_next"/>
			<span class="tify-sr-only">{{ 'Next section'|trans }}</span>
		</button>

		<button
				class="tify-header_button"
				:disabled="$root.customPageViewActive || isLastPage"
				:title="'Last page'|trans"
				@click="goToLastPage"
		>
			<icon name="last_page"/>
			<span class="tify-sr-only">{{ 'Last page'|trans }}</span>
		</button>
	</div>
</template>

<script>
import pagination from '@/mixins/pagination';
import keyboard from '@/mixins/keyboard';

export default {
	name: 'Pagination',
	mixins: [
		keyboard,
		pagination,
	],
	props: {
		keyboard: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			sections: [],
		};
	},
	computed: {
		structures() {
			return this.$root.manifest.structures;
		},
	},
	created() {
		if (!this.structures) return;

		const sections = [];
		this.structures.forEach((structure) => {
			if (!structure.canvases) {
				sections.push({ firstPage: 1, lastPage: this.$root.pageCount });
				return;
			}

			const firstCanvasId = structure.canvases[0];
			const firstPage = this.$root.canvases.findIndex((canvas) => canvas['@id'] === firstCanvasId) + 1;
			const lastCanvasId = structure.canvases[structure.canvases.length - 1];
			const lastPage = this.$root.canvases.findIndex((canvas) => canvas['@id'] === lastCanvasId) + 1;
			sections.push({ firstPage, lastPage });
		});
		this.sections = sections;
	},
	mounted() {
		if (this.keyboard) {
			window.addEventListener('keydown', (event) => {
				if (this.preventKeyboardEvent(event)) return;

				if (this.$root.customPageViewActive) return;

				const { pages } = this.$root.params;

				switch (event.key) {
				case 'q':
				case ',':
					if (pages[0] > 1) this.goToPreviousPage();
					break;
				case 'e':
				case '.':
					if (!this.isLastPage) this.goToNextPage();
					break;
				case 'Q':
					if (pages[0] > 1) this.goToFirstPage();
					break;
				case 'E':
					if (!this.isLastPage) this.goToLastPage();
					break;
				default:
				}
			});
		}
	},
	methods: {
		isLastSection() {
			const { pages } = this.$root.params;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			return page >= this.sections[this.sections.length - 1].firstPage;
		},
		goToNextSection() {
			const { pages } = this.$root.params;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			let sectionIndex = 0;
			while (
				page >= this.sections[sectionIndex].firstPage || (page && page >= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex += 1;
			}
			this.$root.setPage(this.sections[sectionIndex].firstPage);
		},
		goToPreviousSection() {
			const { pages } = this.$root.params;
			const page = pages[0] ? pages[0] : pages[1];
			let sectionIndex = this.sections.length - 1;
			while (
				page <= this.sections[sectionIndex].firstPage || (page && page <= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex -= 1;
			}
			this.$root.setPage(this.sections[sectionIndex].firstPage);
		},
	},
};
</script>

<style scoped>

</style>
