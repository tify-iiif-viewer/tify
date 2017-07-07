<template>
	<header class="tify-header">
		<div class="tify-header_column">
			<h1 class="tify-header_title" :title="titles.join(', ')">
				{{ titles.join(', ') }}
			</h1>
		</div>

		<div class="tify-header_column -pagination">
			<div class="tify-header_button-group">
				<page-select class="tify-header_button"/>

				<button
					class="tify-header_button"
					:class="{
						'-active': $root.params.pages.length > 1,
						'-warning': customPageViewActive,
					}"
					:title="'Double page view'|trans"
					@click="toggleDouble"
				>
					<i v-if="customPageViewActive" class="tify-icon">view_module</i>
					<i v-else class="tify-icon">import_contacts</i>
					<span class="tify-sr-only">{{ 'Double page view'|trans }}</span>
				</button>
			</div>

			<div class="tify-header_button-group">
				<button
					class="tify-header_button"
					:disabled="customPageViewActive || $root.params.pages[0] < 2"
					:title="'First page'|trans"
					@click="$root.setPage(1)"
				>
					<i class="tify-icon">first_page</i>
					<span class="tify-sr-only">{{ 'First page'|trans }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || $root.params.pages[0] < 2"
					:title="'Previous section'|trans"
					@click="goToPreviousSection()"
				>
					<i class="tify-icon">skip_previous</i>
					<span class="tify-sr-only">{{ 'Previous section'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || $root.params.pages[0] < 2"
					:title="'Previous page'|trans"
					@click="goToPreviousPage"
				>
					<i class="tify-icon">navigate_before</i>
					<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="'Next page'|trans"
					@click="goToNextPage"
				>
					<i class="tify-icon">navigate_next</i>
					<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isLastSection"
					:title="'Next section'|trans"
					@click="goToNextSection()"
				>
					<i class="tify-icon">skip_next</i>
					<span class="tify-sr-only">{{ 'Next section'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="'Last page'|trans"
					@click="$root.setPage($root.pageCount)"
				>
					<i class="tify-icon">last_page</i>
					<span class="tify-sr-only">{{ 'Last page'|trans }}</span>
				</button>
			</div>
		</div>

		<div class="tify-header_column -views">
			<div class="tify-header_button-group -small">
				<button
					class="tify-header_toggle-controls"
					v-click-outside="closeControlsPopup"
					@click="toggleControlsPopup"
				>
					<i class="tify-icon">menu</i>
					{{ 'View'|trans }}
				</button>
			</div>

			<div class="tify-header_button-group -large" :class="{ '-visible': controlsVisible }">
				<button
					class="tify-header_button -scan"
					:class="{ '-active': $root.params.view === 'scan' }"
					@click="toggleView('scan')"
				>
					<i class="tify-icon">photo</i>
					{{ 'Scan'|trans }}
				</button>
				<button
					v-if="fulltextEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'fulltext' }"
					@click="toggleView('fulltext')"
				>
					<i class="tify-icon">subject</i>
					{{ 'Fulltext'|trans }}
				</button>
				<button
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'thumbnails' }"
					@click="toggleView('thumbnails')"
				>
					<i class="tify-icon">view_module</i>
					{{ 'Pages'|trans }}
				</button>
				<button
					v-if="tocEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'toc' }"
					@click="toggleView('toc')"
				>
					<i class="tify-icon">toc</i>
					{{ 'Contents'|trans }}
				</button>
				<button
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'info' }"
					@click="toggleView('info')"
				>
					<i class="tify-icon">info_outline</i>
					{{ 'Info'|trans }}
				</button>
				<button
					v-if="exportEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'export' }"
					@click="toggleView('export')"
				>
					<i class="tify-icon">file_download</i>
					{{ 'Export'|trans }}
				</button>
				<button
					class="tify-header_button -help"
					:class="{ '-active': $root.params.view === 'help' }"
					:title="$options.filters.trans('Help')"
					@click="toggleView('help')"
				>
					<i class="tify-icon">help_outline</i>
					{{ 'Help'|trans }}
				</button>
			</div>
			</div>
		</div>
	</header>
</template>

<script>
	import PageSelect from '@/components/PageSelect';

	export default {
		components: {
			PageSelect,
		},
		props: [
			'exportEnabled',
			'fulltextEnabled',
			'tocEnabled',
		],
		data() {
			return {
				controlsVisible: false,
				sections: [],
			};
		},
		computed: {
			customPageViewActive() {
				const pages = this.$root.params.pages;
				const length = pages.length;
				return (
					length > 2
					|| (length === 2 && (pages[0] % 2 > 0 || pages[1] !== pages[0] + 1) && pages[1] > 0)
				);
			},
			isLastPage() {
				const pages = this.$root.params.pages;
				const count = this.$root.pageCount;
				return pages[0] >= count || pages[pages.length - 1] >= count;
			},
			isLastSection() {
				const pages = this.$root.params.pages;
				const lastIndex = pages.length - 1;
				const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
				return page >= this.sections[this.sections.length - 1].firstPage;
			},
			structures() {
				return this.$root.manifest.structures;
			},
			titles() {
				return this.$root.iiifFormat(this.$root.manifest.label);
			},
		},
		methods: {
			closeControlsPopup() {
				this.controlsVisible = false;
			},
			goToNextPage() {
				const pages = this.$root.params.pages;
				let page = pages[0] + 1;
				if (pages.length > 1 && page % 2 > 0 && page < this.$root.pageCount) page += 1;
				this.$root.setPage(page);
			},
			goToNextSection() {
				const pages = this.$root.params.pages;
				const lastIndex = pages.length - 1;
				const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
				let sectionIndex = 0;
				while (
					page >= this.sections[sectionIndex].firstPage
					|| (page && page >= this.sections[sectionIndex].firstPage)
				) sectionIndex += 1;
				this.$root.setPage(this.sections[sectionIndex].firstPage);
			},
			goToPreviousPage() {
				const pages = this.$root.params.pages;
				let page = pages[0] - 1;
				if (pages.length > 1 && page % 2 > 0 && page > 0) page -= 1;
				this.$root.setPage(page);
			},
			goToPreviousSection() {
				const pages = this.$root.params.pages;
				const page = pages[0] ? pages[0] : pages[1];
				let sectionIndex = this.sections.length - 1;
				while (
					page <= this.sections[sectionIndex].firstPage
					|| (page && page <= this.sections[sectionIndex].firstPage)
				) sectionIndex -= 1;
				this.$root.setPage(this.sections[sectionIndex].firstPage);
			},
			toggleControlsPopup() {
				this.controlsVisible = !this.controlsVisible;
			},
			toggleDouble() {
				// TODO: If more than 2 pages selected ...
				const pages = this.$root.params.pages;
				let newPages;
				if (pages.length > 1) {
					// There are already multiple pages shown; switch back to single page
					newPages = [pages[0] < 1 ? 1 : pages[0]];
				} else if (pages[0] < 2) {
					// Show only page 1 in double-page mode
					newPages = [0, 1];
				} else if (pages[0] % 2 > 0) {
					// An odd page was selected, add the preceding page
					newPages = [pages[0] - 1, pages[0]];
				} else {
					// An even page was selected, add the following page or 0 if it is the last one
					const followingPage = (pages[0] < this.$root.pageCount ? pages[0] + 1 : 0);
					newPages = [pages[0], followingPage];
				}
				this.$root.updateParams({ pages: newPages });
			},
			toggleView(name) {
				const view = (name === this.$root.params.view && !this.$root.isMobile() ? '' : name);
				this.$root.updateParams({ view });
			},
		},
		created() {
			if (!this.structures) return;

			const sections = [];
			this.structures.forEach((structure) => {
				const firstCanvasId = structure.canvases[0];
				const firstPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === firstCanvasId) + 1;
				const lastCanvasId = structure.canvases[structure.canvases.length - 1];
				const lastPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});
			this.sections = sections;
		},
	};
</script>
