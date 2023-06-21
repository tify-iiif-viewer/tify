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
			v-if="$store.manifest"
			class="tify-header-column -pagination"
		>
			<div class="tify-header-button-group -page-select">
				<page-select />

				<button
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.pages.length > 1 }"
					:title="$translate('Toggle double-page')"
					@click="toggleDoublePage"
				>
					<icon-view-module v-if="$store.isCustomPageView" />
					<icon-book-open-blank-variant v-else />
				</button>
			</div>

			<div class="tify-header-button-group -pagination">
				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isFirstPage"
					:title="$translate('First page')"
					@click="$store.goToFirstPage()"
				>
					<icon-page-first />
				</button>

				<button
					v-if="$store.manifest.structures"
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isFirstPage"
					:title="$translate('Previous section')"
					@click="goToPreviousSection()"
				>
					<icon-skip-previous />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isFirstPage"
					:title="$translate('Previous page')"
					@click="$store.goToPreviousPage()"
				>
					<icon-chevron-left />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isLastPage"
					:title="$translate('Next page')"
					@click="$store.goToNextPage()"
				>
					<icon-chevron-right />
				</button>

				<button
					v-if="$store.manifest.structures"
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || isLastSection"
					:title="$translate('Next section')"
					@click="goToNextSection()"
				>
					<icon-skip-next />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isLastPage"
					:title="$translate('Last page')"
					@click="$store.goToLastPage()"
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
					:aria-controls="$store.getId('controls')"
					:aria-expanded="controlsVisible ? 'true' : 'false'"
					:aria-label="$translate('View')"
					class="tify-header-button"
					:title="$translate('View')"
					@click="toggleControlsPopup"
				>
					<icon-dots-grid />
				</button>
			</div>
		</div>

		<div
			:id="$store.getId('controls')"
			class="tify-header-column -controls"
			:class="{ '-visible': controlsVisible }"
		>
			<div class="tify-header-button-group -view">
				<!-- NOTE: This button is hidden on large containers -->
				<button
					v-if="$store.manifest"
					type="button"
					class="tify-header-button -scan"
					:class="{ '-active': $store.options.view === 'scan' }"
					:aria-controls="$store.getId('scan')"
					:aria-expanded="$store.options.view === 'scan' ? 'true' : 'false'"
					@click="toggleView('scan')"
				>
					<icon-image />
					{{ $translate('Scan') }}
				</button>

				<button
					v-if="fulltextEnabled"
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.view === 'fulltext' }"
					:aria-controls="$store.getId('fulltext')"
					:aria-expanded="$store.options.view === 'fulltext' ? 'true' : 'false'"
					@click="toggleView('fulltext')"
				>
					<icon-text-long />
					{{ $translate('Fulltext') }}
				</button>

				<button
					v-if="$store.manifest"
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.view === 'thumbnails' }"
					:aria-controls="$store.getId('thumbnails')"
					:aria-expanded="$store.options.view === 'thumbnails' ? 'true' : 'false'"
					@click="toggleView('thumbnails')"
				>
					<icon-view-module />
					{{ $translate('Pages') }}
				</button>

				<button
					v-if="tocEnabled"
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.view === 'toc' }"
					:aria-controls="$store.getId('toc')"
					:aria-expanded="$store.options.view === 'toc' ? 'true' : 'false'"
					@click="toggleView('toc')"
				>
					<icon-table-of-contents />
					{{ $translate('Contents') }}
				</button>

				<button
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.view === 'info' }"
					:aria-controls="$store.getId('info')"
					:aria-expanded="$store.options.view === 'info' ? 'true' : 'false'"
					@click="toggleView('info')"
				>
					<icon-information-variant />
					{{ $translate('Info') }}
				</button>

				<button
					v-if="$store.manifest"
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.view === 'export' }"
					:aria-controls="$store.getId('export')"
					:aria-expanded="$store.options.view === 'export' ? 'true' : 'false'"
					@click="toggleView('export')"
				>
					<icon-download-outline />
					{{ $translate('Export') }}
				</button>

				<button
					v-if="$store.collection"
					type="button"
					class="tify-header-button"
					:class="{ '-active': $store.options.view === 'collection' }"
					:aria-controls="$store.getId('collection')"
					:aria-expanded="$store.options === 'collection' ? 'true' : 'false'"
					@click="toggleView('collection')"
				>
					<icon-list-box-outline />
					{{ $translate('Collection') }}
				</button>
			</div>

			<div v-if="fullscreenSupported" class="tify-header-button-group -view">
				<button
					type="button"
					class="tify-header-button -icon-only"
					:class="{ '-active': $store.options.view === 'help' }"
					:aria-controls="$store.getId('help')"
					:aria-expanded="$store.options.view === 'help' ? 'true' : 'false'"
					:title="$translate('Help')"
					@click="toggleView('help')"
				>
					<icon-help-circle-outline />
					{{ $translate('Help') }}
				</button>
				<button
					v-if="!fullscreenActive"
					type="button"
					class="tify-header-button -icon-only"
					:title="$translate('Fullscreen')"
					@click="toggleFullscreen"
				>
					<icon-fullscreen />
					{{ $translate('Fullscreen') }}
				</button>
				<button
					v-else
					type="button"
					class="tify-header-button -icon-only"
					:title="$translate('Exit fullscreen')"
					@click="toggleFullscreen"
				>
					<icon-fullscreen-exit />
					{{ $translate('Exit fullscreen') }}
				</button>
			</div>

			<div
				v-if="$store.manifest"
				class="tify-header-button-group -popup"
			>
				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isFirstPage"
					:title="$translate('First page')"
					@click="goToFirstPage()"
				>
					<icon-page-first />
				</button>

				<button
					v-if="$store.manifest.structures"
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isFirstPage"
					:title="$translate('Previous section')"
					@click="goToPreviousSection()"
				>
					<icon-skip-previous />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isFirstPage"
					:title="$translate('Previous page')"
					@click="goToPreviousPage()"
				>
					<icon-chevron-left />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isLastPage"
					:title="$translate('Next page')"
					@click="goToNextPage()"
				>
					<icon-chevron-right />
				</button>

				<button
					v-if="$store.manifest.structures"
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isLastSection"
					:title="$translate('Next section')"
					@click="goToNextSection()"
				>
					<icon-skip-next />
				</button>

				<button
					type="button"
					class="tify-header-button"
					:disabled="$store.isCustomPageView || $store.isLastPage"
					:title="$translate('Last page')"
					@click="$store.goToLastPage()"
				>
					<icon-page-last />
				</button>
			</div>
		</div>
	</header>
</template>

<script>
import vClickOutside from 'click-outside-vue3';

import { preventEvent } from '../modules/keyboard';

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
			controlsVisible: false,
			fullscreenActive: false,
			screen: this.$store.rootElement.parentNode,
		};
	},
	computed: {
		fullscreenSupported() {
			return document.fullscreenElement === null || document.webkitFullscreenElement === null;
		},
		isLastSection() {
			const { pages } = this.$store.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			return page >= this.sections[this.sections.length - 1].firstPage;
		},
		sections() {
			const sections = [];

			if (!this.$store.manifest.structures) {
				return sections;
			}

			this.$store.manifest.structures.forEach((structure) => {
				if (!structure.canvases) {
					sections.push({ firstPage: 1, lastPage: this.$store.pageCount });
					return;
				}

				const firstCanvasId = structure.canvases[0];
				const firstPage = this.$store.canvases.findIndex((canvas) => canvas['@id'] === firstCanvasId) + 1;
				const lastCanvasId = structure.canvases[structure.canvases.length - 1];
				const lastPage = this.$store.canvases.findIndex((canvas) => canvas['@id'] === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});

			return sections;
		},
		title() {
			const nbsp = String.fromCharCode(160);
			return (
				this.$store.convertValueToArray((this.$store.manifest || this.$store.collection || {}).label)
					.join(`${nbsp}· `)
					.trim()
					// Ensure the last word does not stand alone in its line if it and
					// the 2nd-to-last word both have at most 10 characters
					.replace(/(\S{1,10})\s+(\S{1,10})$/, `$1${nbsp}$2`)
			);
		},
	},
	created() {
		this.$api.expose(this.setView);
		this.$api.expose(this.toggleDoublePage);
		this.$api.expose(this.toggleFullscreen);
	},
	mounted() {
		this.$store.rootElement.addEventListener('keydown', this.onKeyDown);

		// NOTE: Fullscreen state cannot be computed
		const vendorPrefixes = ['', 'moz', 'webkit'];
		vendorPrefixes.forEach((prefix) => {
			document.addEventListener(`${prefix}fullscreenchange`, this.toggleFullscreenActive);
		});
	},
	beforeUnmount() {
		this.$store.rootElement.removeEventListener('keydown', this.onKeyDown);
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
		goToNextSection() {
			const { pages } = this.$store.options;
			const lastIndex = pages.length - 1;
			const page = pages[lastIndex] ? pages[lastIndex] : pages[lastIndex - 1];
			let sectionIndex = 0;
			while (
				page >= this.sections[sectionIndex].firstPage
					|| (page && page >= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex += 1;
			}
			this.$store.setPage(this.sections[sectionIndex].firstPage);
		},
		goToPreviousSection() {
			const { pages } = this.$store.options;
			const page = pages[0] ? pages[0] : pages[1];
			let sectionIndex = this.sections.length - 1;
			while (
				page <= this.sections[sectionIndex].firstPage
					|| (page && page <= this.sections[sectionIndex].firstPage)
			) {
				sectionIndex -= 1;
			}
			this.$store.setPage(this.sections[sectionIndex].firstPage);
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
					if (this.$store.manifest && this.fulltextEnabled) {
						this.toggleView('fulltext');
					}
					break;
				case '2':
					if (this.$store.manifest) {
						this.toggleView('thumbnails');
					}
					break;
				case '3':
					if (this.$store.manifest && this.tocEnabled) {
						this.toggleView('toc');
					}
					break;
				case '4':
					this.toggleView('info');
					break;
				case '5':
					if (this.$store.manifest) {
						this.toggleView('export');
					}
					break;
				case '6':
					if (this.$store.collection) {
						this.toggleView('collection');
					}
					break;
				case '7':
					this.toggleView('help');
					break;
				case 'b':
					if (this.$store.manifest) {
						this.toggleDoublePage();
					}
					break;
				case 'f':
					this.toggleFullscreen();
					break;
				default:
			}

			if (!this.$store.manifest || this.$store.isCustomPageView) {
				return;
			}

			const { pages } = this.$store.options;

			switch (event.key) {
				case 'q':
				case ',':
					if (pages[0] > 1) {
						this.$store.goToPreviousPage();
					}
					break;
				case 'e':
				case '.':
					if (!this.isLastPage) {
						this.$store.goToNextPage();
					}
					break;
				case 'Q':
					if (pages[0] > 1) {
						this.$store.goToFirstPage();
					}
					break;
				case 'E':
					if (!this.isLastPage) {
						this.$store.goToLastPage();
					}
					break;
				default:
			}
		},
		setView(name) {
			this.$store.updateOptions({ view: name });
		},
		toggleControlsPopup() {
			this.controlsVisible = !this.controlsVisible;
		},
		toggleDoublePage(forced) {
			const { pages } = this.$store.options;
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
				const followingPage = pages[0] < this.$store.pageCount ? pages[0] + 1 : 0;
				newPages = [pages[0], followingPage];
			}

			this.$store.updateOptions({ pages: newPages });
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
			const view = name === this.$store.options.view && this.$store.manifest && !this.$store.isMobile()
				? ''
				: name;
			this.$store.updateOptions({ view });
			return view;
		},
	},
};
</script>
