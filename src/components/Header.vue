<template>
	<header class="tify-header">
		<div class="tify-header_column -title">
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
					:title="'Toggle double-page'|trans"
					@click="toggleDoublePage"
				>
					<icon v-if="customPageViewActive" name="view_module"/>
					<icon v-else name="import_contacts"/>
					<span class="tify-sr-only">{{ 'Toggle double-page'|trans }}</span>
				</button>

				<template v-if="detectFullscreen !== false">
					<template v-if="fullscreenActive">
						<button
							class="tify-header_button exit_fullscreen"
							:title="'Exit fullscreen'|trans"
							@click="toggleFullscreen"
						>
							<icon name="fullscreen_exit"/>
							<span class="tify-sr-only">{{ 'Exit fullscreen'|trans }}</span>
						</button>
					</template>
					<template v-else>
						<button
							class="tify-header_button fullscreen"
							:title="'Fullscreen'|trans"
							@click="toggleFullscreen"
						>
							<icon name="fullscreen"/>
							<span class="tify-sr-only">{{ 'Fullscreen'|trans }}</span>
						</button>
					</template>
				</template>
			</div>

			<div class="tify-header_button-group -pagination">
				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="'First page'|trans"
					@click="goToFirstPage"
				>
					<icon name="first_page"/>
					<span class="tify-sr-only">{{ 'First page'|trans }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="'Previous section'|trans"
					@click="goToPreviousSection"
				>
					<icon name="skip_previous"/>
					<span class="tify-sr-only">{{ 'Previous section'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="'Previous page'|trans"
					@click="goToPreviousPage"
				>
					<icon name="navigate_before"/>
					<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="'Next page'|trans"
					@click="goToNextPage"
				>
					<icon name="navigate_next"/>
					<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isLastSection"
					:title="'Next section'|trans"
					@click="goToNextSection"
				>
					<icon name="skip_next"/>
					<span class="tify-sr-only">{{ 'Next section'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="'Last page'|trans"
					@click="goToLastPage"
				>
					<icon name="last_page"/>
					<span class="tify-sr-only">{{ 'Last page'|trans }}</span>
				</button>
			</div>
		</div>

		<div class="tify-header_column -views">
			<div class="tify-header_button-group -toggle" ref="switchViewSmall">
				<button
					class="tify-header_button"
					v-click-outside="closeControlsPopup"
					@click="toggleControlsPopup"
				>
					<icon name="menu"/>
					{{ 'View'|trans }}
				</button>
			</div>

			<div
				class="tify-header_button-group -view"
				:class="{ '-visible': controlsVisible }"
			>
				<button
					class="tify-header_button -scan"
					:class="{ '-active': $root.params.view === 'scan' }"
					@click="toggleView('scan')"
				>
					<icon name="photo"/>
					{{ 'Scan'|trans }}
				</button>

				<button
					v-if="fulltextEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'fulltext' }"
					@click="toggleView('fulltext')"
				>
					<icon name="subject"/>
					{{ 'Fulltext'|trans }}
				</button>

				<button
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'thumbnails' }"
					@click="toggleView('thumbnails')"
				>
					<icon name="view_module"/>
					{{ 'Pages'|trans }}
				</button>

				<button
					v-if="tocEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'toc' }"
					@click="toggleView('toc')"
				>
					<icon name="toc"/>
					{{ 'Contents'|trans }}
				</button>

				<button
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'info' }"
					@click="toggleView('info')"
				>
					<icon name="info_outline"/>
					{{ 'Info'|trans }}
				</button>

				<button
					class="tify-header_button"
					:class="{ '-active': $root.params.view === 'export' }"
					@click="toggleView('export')"
				>
					<icon name="file_download"/>
					{{ 'Export'|trans }}
				</button>

				<button
					class="tify-header_button -help"
					:class="{ '-active': $root.params.view === 'help' }"
					:title="$options.filters.trans('Help')"
					@click="toggleView('help')"
				>
					<icon name="help_outline"/>
					{{ 'Help'|trans }}
				</button>

				<div class="tify-header_button-group -popup">
					<button
						class="tify-header_button"
						:disabled="customPageViewActive || isFirstPage"
						:title="'First page'|trans"
						@click="goToFirstPage"
					>
						<icon name="first_page"/>
						<span class="tify-sr-only">{{ 'First page'|trans }}</span>
					</button>

					<button
						v-if="structures && structures.length"
						class="tify-header_button"
						:disabled="customPageViewActive || isFirstPage"
						:title="'Previous section'|trans"
						@click="goToPreviousSection"
					>
						<icon name="skip_previous"/>
						<span class="tify-sr-only">{{ 'Previous section'|trans }}</span>
					</button>

					<button
						class="tify-header_button"
						:disabled="customPageViewActive || isFirstPage"
						:title="'Previous page'|trans"
						@click="goToPreviousPage"
					>
						<icon name="navigate_before"/>
						<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
					</button>

					<button
						class="tify-header_button"
						:disabled="customPageViewActive || isLastPage"
						:title="'Next page'|trans"
						@click="goToNextPage"
					>
						<icon name="navigate_next"/>
						<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
					</button>

					<button
						v-if="structures && structures.length"
						class="tify-header_button"
						:disabled="customPageViewActive || isLastSection"
						:title="'Next section'|trans"
						@click="goToNextSection"
					>
						<icon name="skip_next"/>
						<span class="tify-sr-only">{{ 'Next section'|trans }}</span>
					</button>

					<button
						class="tify-header_button"
						:disabled="customPageViewActive || isLastPage"
						:title="'Last page'|trans"
						@click="goToLastPage"
					>
						<icon name="last_page"/>
						<span class="tify-sr-only">{{ 'Last page'|trans }}</span>
					</button>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
	import PageSelect from '@/components/PageSelect';

	import keyboard from '@/mixins/keyboard';
	import pagination from '@/mixins/pagination';

	export default {
		components: {
			PageSelect,
		},
		mixins: [
			keyboard,
			pagination,
		],
		props: [
			'fulltextEnabled',
			'tocEnabled',
		],
		data() {
			return {
				controlsVisible: false,
				fullscreenActive: false,
				screen: this.$root.$el.parentNode,
				sections: [],
			};
		},
		computed: {
			isLastSection() {
				const { pages } = this.$root.params;
				const lastIndex = pages.length - 1;
				const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
				return page >= this.sections[this.sections.length - 1].firstPage;
			},
			structures() {
				return this.$root.manifest.structures;
			},
			titles() {
				return this.$root.iiifConvertToArray(this.$root.manifest.label);
			},
		},
		methods: {
			closeControlsPopup() {
				this.controlsVisible = false;
			},
			detectFullscreen: () => {
				let fullscreenAPI;

				// fullscreenAPI is set to the browser's implementation of the fullscreen API
				// (if supported). If the fullscreen API isn't supported, fullscreenAPI is set to false.
				switch (null) {
				case document.msFullscreenElement:
					fullscreenAPI = document.msFullscreenElement;
					break;
				case document.webkitFullscreenElement:
					fullscreenAPI = document.webkitFullscreenElement;
					break;
				case document.fullscreenElement:
					fullscreenAPI = document.fullscreenElement;
					break;
				default:
					fullscreenAPI = false;
				}

				return fullscreenAPI;
			},
			goToNextSection() {
				const { pages } = this.$root.params;
				const lastIndex = pages.length - 1;
				const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
				let sectionIndex = 0;
				while (
					page >= this.sections[sectionIndex].firstPage
					|| (page && page >= this.sections[sectionIndex].firstPage)
				) sectionIndex += 1;
				this.$root.setPage(this.sections[sectionIndex].firstPage);
			},
			goToPreviousSection() {
				const { pages } = this.$root.params;
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
			toggleDoublePage() {
				const { pages } = this.$root.params;
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
			toggleFullscreen() {
				this.fullscreenActive = !this.fullscreenActive;
				if (this.detectFullscreen() !== null) {
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.mozCancelFullScreen) { // Firefox
						document.mozCancelFullScreen();
					} else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
						document.webkitExitFullscreen();
					} else if (document.msExitFullscreen) { // IE/Edge
						document.msExitFullscreen();
					}
				} else if (this.screen.requestFullscreen) {
					this.screen.requestFullscreen();
				} else if (this.screen.mozRequestFullScreen) { // Firefox
					this.screen.mozRequestFullScreen();
				} else if (this.screen.webkitRequestFullscreen) { // Chrome, Safari and Opera
					this.screen.webkitRequestFullscreen();
				} else if (this.screen.msRequestFullscreen) { // IE/Edge
					this.screen.msRequestFullscreen();
				}
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
				if (!structure.canvases) {
					sections.push({ firstPage: 1, lastPage: this.$root.pageCount });
					return;
				}

				const firstCanvasId = structure.canvases[0];
				const firstPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === firstCanvasId) + 1;
				const lastCanvasId = structure.canvases[structure.canvases.length - 1];
				const lastPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});
			this.sections = sections;
		},
		mounted() {
			window.addEventListener('keydown', (event) => {
				if (this.preventKeyboardEvent(event)) return;

				if (event.key === 'Escape') {
					this.controlsVisible = false;
					return;
				}

				switch (event.key) {
				case 'Backspace':
					// switchViewSmall is visible, i.e. screen is small
					if (this.$refs.switchViewSmall.offsetParent) this.toggleView('scan');
					break;
				case '1':
					if (this.fulltextEnabled) this.toggleView('fulltext');
					break;
				case '2':
					this.toggleView('thumbnails');
					break;
				case '3':
					if (this.tocEnabled) this.toggleView('toc');
					break;
				case '4':
					this.toggleView('info');
					break;
				case '5':
					this.toggleView('export');
					break;
				case '6':
					this.toggleView('help');
					break;
				case 'b':
					this.toggleDoublePage();
					break;
				default:
				}

				if (this.customPageViewActive) return;

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
				case 'u':
				case 'U':
					this.toggleFullscreen();
					break;
				default:
				}
			});
		},
	};
</script>
