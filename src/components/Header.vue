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
						'-active': $root.options.pages.length > 1,
						'-warning': customPageViewActive,
					}"
					:title="$root.translate('Toggle double-page')"
					@click="toggleDoublePage"
				>
					<icon-view-module v-if="customPageViewActive" decorative/>
					<icon-book-open-blank-variant v-else decorative/>
					<span class="tify-sr-only">{{ $root.translate('Toggle double-page') }}</span>
				</button>
			</div>

			<div class="tify-header_button-group -pagination">
				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="$root.translate('First page')"
					@click="goToFirstPage"
				>
					<icon-page-first decorative/>
					<span class="tify-sr-only">{{ $root.translate('First page') }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="$root.translate('Previous section')"
					@click="goToPreviousSection"
				>
					<icon-skip-previous decorative/>
					<span class="tify-sr-only">{{ $root.translate('Previous section') }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="$root.translate('Previous page')"
					@click="goToPreviousPage"
				>
					<icon-chevron-left decorative/>
					<span class="tify-sr-only">{{ $root.translate('Previous page') }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="$root.translate('Next page')"
					@click="goToNextPage"
				>
					<icon-chevron-right decorative/>
					<span class="tify-sr-only">{{ $root.translate('Next page') }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isLastSection"
					:title="$root.translate('Next section')"
					@click="goToNextSection"
				>
					<icon-skip-next decorative/>
					<span class="tify-sr-only">{{ $root.translate('Next section') }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="$root.translate('Last page')"
					@click="goToLastPage"
				>
					<icon-page-last decorative/>
					<span class="tify-sr-only">{{ $root.translate('Last page') }}</span>
				</button>
			</div>
		</div>

		<div class="tify-header_column -controls-toggle">
			<div class="tify-header_button-group" ref="switchViewSmall">
				<button
					class="tify-header_button"
					v-click-outside="closeControlsPopup"
					@click="toggleControlsPopup"
				>
					<icon-menu decorative/>
					{{ $root.translate('View') }}
				</button>
			</div>
		</div>

		<div class="tify-header_column -controls" :class="{ '-visible': controlsVisible }">
			<div class="tify-header_button-group -view">
				<button
					class="tify-header_button -scan"
					:class="{ '-active': $root.options.view === 'scan' }"
					@click="toggleView('scan')"
				>
					<icon-image decorative/>
					{{ $root.translate('Scan') }}
				</button>

				<button
					v-if="fulltextEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.options.view === 'fulltext' }"
					@click="toggleView('fulltext')"
				>
					<icon-text-long decorative/>
					{{ $root.translate('Fulltext') }}
				</button>

				<button
					class="tify-header_button"
					:class="{ '-active': $root.options.view === 'thumbnails' }"
					@click="toggleView('thumbnails')"
				>
					<icon-view-module decorative/>
					{{ $root.translate('Pages') }}
				</button>

				<button
					v-if="tocEnabled"
					class="tify-header_button"
					:class="{ '-active': $root.options.view === 'toc' }"
					@click="toggleView('toc')"
				>
					<icon-table-of-contents decorative/>
					{{ $root.translate('Contents') }}
				</button>

				<button
					class="tify-header_button"
					:class="{ '-active': $root.options.view === 'info' }"
					@click="toggleView('info')"
				>
					<icon-information-outline decorative/>
					{{ $root.translate('Info') }}
				</button>

				<button
					class="tify-header_button"
					:class="{ '-active': $root.options.view === 'export' }"
					@click="toggleView('export')"
				>
					<icon-download decorative/>
					{{ $root.translate('Export') }}
				</button>

				<button
					class="tify-header_button -icon-only"
					:class="{ '-active': $root.options.view === 'help' }"
					:title="$root.translate('Help')"
					@click="toggleView('help')"
				>
					<icon-help-circle-outline decorative/>
					{{ $root.translate('Help') }}
				</button>
			</div>

			<div class="tify-header_button-group -view" v-if="fullscreenSupported">
				<button
					v-if="!fullscreenActive"
					class="tify-header_button -icon-only"
					:title="$root.translate('Fullscreen')"
					@click="toggleFullscreen"
				>
					<icon-fullscreen decorative/>
					{{ $root.translate('Fullscreen') }}
				</button>
				<button
					v-else
					class="tify-header_button -icon-only"
					:title="$root.translate('Exit fullscreen')"
					@click="toggleFullscreen"
				>
					<icon-fullscreen-exit decorative/>
					{{ $root.translate('Exit fullscreen') }}
				</button>
			</div>

			<div class="tify-header_button-group -popup">
				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="$root.translate('First page')"
					@click="goToFirstPage"
				>
					<icon-page-first decorative/>
					<span class="tify-sr-only">{{ $root.translate('First page') }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="$root.translate('Previous section')"
					@click="goToPreviousSection"
				>
					<icon-skip-previous decorative/>
					<span class="tify-sr-only">{{ $root.translate('Previous section') }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isFirstPage"
					:title="$root.translate('Previous page')"
					@click="goToPreviousPage"
				>
					<icon-chevron-left decorative/>
					<span class="tify-sr-only">{{ $root.translate('Previous page') }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="$root.translate('Next page')"
					@click="goToNextPage"
				>
					<icon-chevron-right decorative/>
					<span class="tify-sr-only">{{ $root.translate('Next page') }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="customPageViewActive || isLastSection"
					:title="$root.translate('Next section')"
					@click="goToNextSection"
				>
					<icon-skip-next decorative/>
					<span class="tify-sr-only">{{ $root.translate('Next section') }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="customPageViewActive || isLastPage"
					:title="$root.translate('Last page')"
					@click="goToLastPage"
				>
					<icon-page-last decorative/>
					<span class="tify-sr-only">{{ $root.translate('Last page') }}</span>
				</button>
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
		fullscreenSupported() {
			return document.fullscreenElement === null
					|| document.msFullscreenElement === null
					|| document.webkitFullscreenElement === null;
		},
		isLastSection() {
			const { pages } = this.$root.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			return page >= this.sections[this.sections.length - 1].firstPage;
		},
		structures() {
			return this.$root.manifest.structures;
		},
		titles() {
			return this.$root.convertValueToArray(this.$root.manifest.label);
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
			const { pages } = this.$root.options;
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
			const { pages } = this.$root.options;
			const page = pages[0] ? pages[0] : pages[1];
			let sectionIndex = this.sections.length - 1;
			while (
				page <= this.sections[sectionIndex].firstPage || (page && page <= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex -= 1;
			}
			this.$root.setPage(this.sections[sectionIndex].firstPage);
		},
		toggleControlsPopup() {
			this.controlsVisible = !this.controlsVisible;
		},
		toggleDoublePage(force) {
			const { pages } = this.$root.options;
			let newPages;
			if ((pages.length > 1 && force !== true) || force === false) {
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

			this.$root.updateOptions({ pages: newPages });
			return newPages;
		},
		toggleFullscreen(force) {
			if ((this.fullscreenActive && force !== true) || force === false) {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.mozCancelFullScreen) { // Firefox
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
					document.webkitExitFullscreen();
				} else if (document.msExitFullscreen) { // IE/Edge
					document.msExitFullscreen();
				}

				return false;
			}

			if (this.screen.requestFullscreen) {
				this.screen.requestFullscreen();
			} else if (this.screen.mozRequestFullScreen) { // Firefox
				this.screen.mozRequestFullScreen();
			} else if (this.screen.webkitRequestFullscreen) { // Chrome, Safari and Opera
				this.screen.webkitRequestFullscreen();
			} else if (this.screen.msRequestFullscreen) { // IE/Edge
				this.screen.msRequestFullscreen();
			}

			return true;
		},
		toggleFullscreenActive() {
			this.fullscreenActive = !this.fullscreenActive;
		},
		toggleView(name, force) {
			const view = (name === this.$root.options.view && !this.$root.isMobile() && force !== true)
					|| force === false
				? ''
				: name;
			this.$root.updateOptions({ view });
			return view;
		},
	},
	created() {
		this.$root.expose(this.toggleView);
		this.$root.expose(this.toggleDoublePage);
		this.$root.expose(this.toggleFullscreen);

		if (!this.structures) {
			return;
		}

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
		window.addEventListener('keydown', (event) => {
			if (this.preventKeyboardEvent(event)) {
				return;
			}

			if (event.key === 'Escape') {
				this.controlsVisible = false;
				return;
			}

			switch (event.key) {
			case 'Backspace':
				// switchViewSmall is visible, i.e. screen is small
				if (this.$refs.switchViewSmall.offsetParent) {
					this.toggleView('scan');
				}

				break;
			case '1':
				if (this.fulltextEnabled) {
					this.toggleView('fulltext');
				}

				break;
			case '2':
				this.toggleView('thumbnails');
				break;
			case '3':
				if (this.tocEnabled) {
					this.toggleView('toc');
				}

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
			case 'f':
				// TODO: This is stolen by OpenSeadragon!
				this.toggleFullscreen();
				break;
			default:
			}

			if (this.customPageViewActive) {
				return;
			}

			const { pages } = this.$root.options;

			switch (event.key) {
			case 'q':
			case ',':
				if (pages[0] > 1) {
					this.goToPreviousPage();
				}

				break;
			case 'e':
			case '.':
				if (!this.isLastPage) {
					this.goToNextPage();
				}

				break;
			case 'Q':
				if (pages[0] > 1) {
					this.goToFirstPage();
				}

				break;
			case 'E':
				if (!this.isLastPage) {
					this.goToLastPage();
				}

				break;
			default:
			}
		});

		// NOTE: Fullscreen state cannot be computed
		['', 'moz', 'ms', 'webkit'].forEach((prefix) => {
			document.addEventListener(`${prefix}fullscreenchange`, this.toggleFullscreenActive);
		});
	},
};
</script>
