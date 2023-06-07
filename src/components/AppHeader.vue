<template>
	<header class="tify-header">
		<div class="tify-header-column -title">
			<h1
				class="tify-header-title"
				:title="title"
			>
				{{ title }}
			</h1>
		</div>

		<div
			v-if="manifest['@id']"
			class="tify-header-column -pagination"
		>
			<div class="tify-header-button-group -page-select">
				<page-select />

				<button
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.pages.length > 1 }"
					:title="translate('Toggle double-page')"
					@click="toggleDoublePage"
				>
					<icon-view-module v-if="customPageViewActive" />
					<icon-book-open-blank-variant v-else />
				</button>
			</div>

			<div class="tify-header-button-group -pagination">
				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isFirstPage"
					:title="translate('First page')"
					@click="goToFirstPage"
				>
					<icon-page-first />
				</button>

				<button
					v-if="structures && structures.length"
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isFirstPage"
					:title="translate('Previous section')"
					@click="goToPreviousSection"
				>
					<icon-skip-previous />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isFirstPage"
					:title="translate('Previous page')"
					@click="goToPreviousPage"
				>
					<icon-chevron-left />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isLastPage"
					:title="translate('Next page')"
					@click="goToNextPage"
				>
					<icon-chevron-right />
				</button>

				<button
					v-if="structures && structures.length"
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isLastSection"
					:title="translate('Next section')"
					@click="goToNextSection"
				>
					<icon-skip-next />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isLastPage"
					:title="translate('Last page')"
					@click="goToLastPage"
				>
					<icon-page-last />
				</button>
			</div>
		</div>

		<div class="tify-header-column -toggle">
			<div
				ref="switchViewSmall"
				class="tify-header-button-group -toggle"
			>
				<button
					v-click-outside="closeControlsPopup"
					type="button"
					:aria-controls="getId('controls')"
					:aria-expanded="controlsVisible ? 'true' : 'false'"
					:aria-label="translate('View')"
					class="tify-header-button"
					:title="translate('View')"
					@click="toggleControlsPopup"
				>
					<icon-dots-grid />
				</button>
			</div>
		</div>

		<div
			:id="getId('controls')"
			class="tify-header-column -controls"
			:class="{ '-visible': controlsVisible }"
		>
			<div class="tify-header-button-group -view">
				<!-- NOTE: This button is hidden on large containers -->
				<button
					v-if="manifest['@id']"
					type="button"
					class="tify-header-button -scan"
					:class="{ '-active': options.view === 'scan' }"
					:aria-controls="getId('scan')"
					:aria-expanded="options.view === 'scan' ? 'true' : 'false'"
					@click="toggleView('scan')"
				>
					<icon-image />
					{{ translate('Scan') }}
				</button>

				<button
					v-if="fulltextEnabled"
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.view === 'fulltext' }"
					:aria-controls="getId('fulltext')"
					:aria-expanded="options.view === 'fulltext' ? 'true' : 'false'"
					@click="toggleView('fulltext')"
				>
					<icon-text-long />
					{{ translate('Fulltext') }}
				</button>

				<button
					v-if="manifest['@id']"
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.view === 'thumbnails' }"
					:aria-controls="getId('thumbnails')"
					:aria-expanded="options.view === 'thumbnails' ? 'true' : 'false'"
					@click="toggleView('thumbnails')"
				>
					<icon-view-module />
					{{ translate('Pages') }}
				</button>

				<button
					v-if="tocEnabled"
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.view === 'toc' }"
					:aria-controls="getId('toc')"
					:aria-expanded="options.view === 'toc' ? 'true' : 'false'"
					@click="toggleView('toc')"
				>
					<icon-table-of-contents />
					{{ translate('Contents') }}
				</button>

				<button
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.view === 'info' }"
					:aria-controls="getId('info')"
					:aria-expanded="options.view === 'info' ? 'true' : 'false'"
					@click="toggleView('info')"
				>
					<icon-information-variant />
					{{ translate('Info') }}
				</button>

				<button
					v-if="manifest['@id']"
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.view === 'export' }"
					:aria-controls="getId('export')"
					:aria-expanded="options.view === 'export' ? 'true' : 'false'"
					@click="toggleView('export')"
				>
					<icon-download-outline />
					{{ translate('Export') }}
				</button>

				<button
					v-if="collection['@id']"
					type="button"
					class="tify-header-button"
					:class="{ '-active': options.view === 'collection' }"
					:aria-controls="getId('collection')"
					:aria-expanded="options === 'collection' ? 'true' : 'false'"
					@click="toggleView('collection')"
				>
					<icon-list-box-outline />
					{{ translate('Collection') }}
				</button>
			</div>

			<div v-if="fullscreenSupported" class="tify-header-button-group -view">
				<button
					type="button"
					class="tify-header-button -icon-only"
					:class="{ '-active': options.view === 'help' }"
					:aria-controls="getId('help')"
					:aria-expanded="options.view === 'help' ? 'true' : 'false'"
					:title="translate('Help')"
					@click="toggleView('help')"
				>
					<icon-help-circle-outline />
					{{ translate('Help') }}
				</button>
				<button
					v-if="!fullscreenActive"
					type="button"
					class="tify-header-button -icon-only"
					:title="translate('Fullscreen')"
					@click="toggleFullscreen"
				>
					<icon-fullscreen />
					{{ translate('Fullscreen') }}
				</button>
				<button
					v-else
					type="button"
					class="tify-header-button -icon-only"
					:title="translate('Exit fullscreen')"
					@click="toggleFullscreen"
				>
					<icon-fullscreen-exit />
					{{ translate('Exit fullscreen') }}
				</button>
			</div>

			<div
				v-if="manifest['@id']"
				class="tify-header-button-group -popup"
			>
				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isFirstPage"
					:title="translate('First page')"
					@click="goToFirstPage"
				>
					<icon-page-first />
				</button>

				<button
					v-if="structures && structures.length"
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isFirstPage"
					:title="translate('Previous section')"
					@click="goToPreviousSection"
				>
					<icon-skip-previous />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isFirstPage"
					:title="translate('Previous page')"
					@click="goToPreviousPage"
				>
					<icon-chevron-left />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isLastPage"
					:title="translate('Next page')"
					@click="goToNextPage"
				>
					<icon-chevron-right />
				</button>

				<button
					v-if="structures && structures.length"
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isLastSection"
					:title="translate('Next section')"
					@click="goToNextSection"
				>
					<icon-skip-next />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="customPageViewActive || isLastPage"
					:title="translate('Last page')"
					@click="goToLastPage"
				>
					<icon-page-last />
				</button>
			</div>
		</div>
	</header>
</template>

<script>
import vClickOutside from 'click-outside-vue3';

import { canvases, collection, manifest, options, pageCount, updateOptions } from '../modules/store';
import { expose } from '../modules/api';
import { getId } from '../modules/id';
import { translate } from '../modules/i18n';
import { convertValueToArray } from '../modules/iiif';
import { preventEvent } from '../modules/keyboard';
import {
	customPageViewActive,
	goToFirstPage,
	goToLastPage,
	goToNextPage,
	goToPreviousPage,
	isFirstPage,
	isLastPage,
	setPage,
} from '../modules/pagination';
import { isMobile } from '../modules/ui';

export default {
	directives: {
		clickOutside: vClickOutside.directive,
	},
	props: {
		fulltextEnabled: Boolean,
		tocEnabled: Boolean,
	},
	data() {
		return {
			collection,
			controlsVisible: false,
			customPageViewActive,
			fullscreenActive: false,
			isFirstPage,
			isLastPage,
			manifest,
			options,
			screen: options.root.$el.parentNode,
		};
	},
	computed: {
		fullscreenSupported() {
			return document.fullscreenElement === null || document.webkitFullscreenElement === null;
		},
		isLastSection() {
			const { pages } = options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			return page >= this.sections[this.sections.length - 1].firstPage;
		},
		sections() {
			const sections = [];

			if (!this.structures) {
				return sections;
			}

			this.structures.forEach((structure) => {
				if (!structure.canvases) {
					sections.push({ firstPage: 1, lastPage: pageCount.value });
					return;
				}

				const firstCanvasId = structure.canvases[0];
				const firstPage = canvases.value.findIndex((canvas) => canvas['@id'] === firstCanvasId) + 1;
				const lastCanvasId = structure.canvases[structure.canvases.length - 1];
				const lastPage = canvases.value.findIndex((canvas) => canvas['@id'] === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});

			return sections;
		},
		structures() {
			return manifest ? manifest.structures : [];
		},
		title() {
			return (
				convertValueToArray((manifest || collection || {}).label)
					.join(`${String.fromCharCode(160)}· `) // 160 = &nbsp;
					.trim()
					// Ensure the last word does not stand alone in its line if it and
					// the 2nd-to-last word both have at most 10 characters
					.replace(/(\S{1,10})\s+(\S{1,10})$/, `$1${String.fromCharCode(160)}$2`)
			);
		},
	},
	created() {
		expose(this.setView);
		expose(this.toggleDoublePage);
		expose(this.toggleFullscreen);
	},
	mounted() {
		options.root.$el.addEventListener('keydown', this.onKeyDown);

		// NOTE: Fullscreen state cannot be computed
		const vendorPrefixes = ['', 'moz', 'webkit'];
		vendorPrefixes.forEach((prefix) => {
			document.addEventListener(`${prefix}fullscreenchange`, this.toggleFullscreenActive);
		});
	},
	beforeUnmount() {
		options.root.$el.removeEventListener('keydown', this.onKeyDown);
	},
	methods: {
		closeControlsPopup() {
			this.controlsVisible = false;
		},
		detectFullscreen() {
			let fullscreenAPI;

			// fullscreenAPI is set to the browser's implementation of the fullscreen API
			// (if supported). If the fullscreen API isn't supported, fullscreenAPI is set to false.
			switch (null) {
				case document.fullscreenElement:
					fullscreenAPI = document.fullscreenElement;
					break;
				case document.webkitFullscreenElement:
					fullscreenAPI = document.webkitFullscreenElement;
					break;
				default:
					fullscreenAPI = false;
			}

			return fullscreenAPI;
		},
		getId,
		goToFirstPage,
		goToLastPage,
		goToNextPage,
		goToPreviousPage,
		goToNextSection() {
			const { pages } = options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			let sectionIndex = 0;
			while (
				page >= this.sections[sectionIndex].firstPage
					|| (page && page >= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex += 1;
			}
			setPage(this.sections[sectionIndex].firstPage);
		},
		goToPreviousSection() {
			const { pages } = options;
			const page = pages[0] ? pages[0] : pages[1];
			let sectionIndex = this.sections.length - 1;
			while (
				page <= this.sections[sectionIndex].firstPage
					|| (page && page <= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex -= 1;
			}
			setPage(this.sections[sectionIndex].firstPage);
		},
		onKeyDown(event) {
			if (preventEvent(event)) {
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
					if (manifest && this.fulltextEnabled) {
						this.toggleView('fulltext');
					}
					break;
				case '2':
					if (manifest) {
						this.toggleView('thumbnails');
					}
					break;
				case '3':
					if (manifest && this.tocEnabled) {
						this.toggleView('toc');
					}
					break;
				case '4':
					this.toggleView('info');
					break;
				case '5':
					if (manifest) {
						this.toggleView('export');
					}
					break;
				case '6':
					if (collection) {
						this.toggleView('collection');
					}
					break;
				case '7':
					this.toggleView('help');
					break;
				case 'b':
					if (manifest) {
						this.toggleDoublePage();
					}
					break;
				case 'f':
					this.toggleFullscreen();
					break;
				default:
			}

			if (!manifest || this.customPageViewActive) {
				return;
			}

			const { pages } = options;

			switch (event.key) {
				case 'q':
				case ',':
					if (pages[0] > 1) {
						goToPreviousPage();
					}
					break;
				case 'e':
				case '.':
					if (!this.isLastPage) {
						goToNextPage();
					}
					break;
				case 'Q':
					if (pages[0] > 1) {
						goToFirstPage();
					}
					break;
				case 'E':
					if (!this.isLastPage) {
						goToLastPage();
					}
					break;
				default:
			}
		},
		setView(name) {
			updateOptions({ view: name });
		},
		toggleControlsPopup() {
			this.controlsVisible = !this.controlsVisible;
		},
		toggleDoublePage(forced) {
			const { pages } = options;
			let newPages;
			if ((pages.length > 1 && forced !== true) || forced === false) {
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
				const followingPage = pages[0] < pageCount.value ? pages[0] + 1 : 0;
				newPages = [pages[0], followingPage];
			}

			updateOptions({ pages: newPages });
			return newPages;
		},
		toggleFullscreen(forced) {
			if ((this.fullscreenActive && forced !== true) || forced === false) {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.mozCancelFullScreen) {
					// Firefox
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					// Chrome, Safari and Opera
					document.webkitExitFullscreen();
				}
				return false;
			}

			if (this.screen.requestFullscreen) {
				this.screen.requestFullscreen();
			} else if (this.screen.mozRequestFullScreen) {
				// Firefox
				this.screen.mozRequestFullScreen();
			} else if (this.screen.webkitRequestFullscreen) {
				// Chrome, Safari and Opera
				this.screen.webkitRequestFullscreen();
			}

			return true;
		},
		toggleFullscreenActive() {
			this.fullscreenActive = !this.fullscreenActive;
		},
		toggleView(name) {
			const view = name === options.view && manifest && !isMobile()
				? ''
				: name;
			updateOptions({ view });
			return view;
		},
		translate,
	},
};
</script>
