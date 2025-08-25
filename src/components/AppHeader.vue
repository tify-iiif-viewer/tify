<script>
import { onClickOutside, useFullscreen } from '@vueuse/core';

import { preventEvent } from '../modules/keyboard';

export default {
	props: {
		textEnabled: Boolean,
		tocEnabled: Boolean,
	},
	data() {
		return {
			controlsVisible: false,
			fullscreen: useFullscreen(this.$store.rootElement.parentNode),
		};
	},
	computed: {
		doublePageEnabled() {
			if (this.$store.manifest.behavior?.some((string) => ['continuous', 'individuals'].includes(string))) {
				return false;
			}

			return this.$store.manifest.items.some((item) => item.items?.[0]?.items?.[0]?.body?.type === 'Image');
		},
		title() {
			const nbsp = String.fromCharCode(160);
			return (
				this.$store.localize((this.$store.manifest || this.$store.collection || {}).label)
					// Ensure the last word does not stand alone in its line if it and
					// the 2nd-to-last word both have at most 10 characters
					.replace(/(\S{1,10})\s+(\S{1,10})$/, `$1${nbsp}$2`)
			);
		},
	},
	created() {
		this.$api.expose(this.setView);
		this.$api.expose(this.toggleDoublePage);
		this.$api.expose(this.fullscreen.toggle);
	},
	mounted() {
		this.$store.rootElement.addEventListener('keydown', this.onKeyDown);

		onClickOutside(this.$refs.controls, () => {
			this.closeControlsPopup();
		});
	},
	beforeUnmount() {
		this.$store.rootElement.removeEventListener('keydown', this.onKeyDown);
	},
	methods: {
		closeControlsPopup() {
			this.controlsVisible = false;
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
						this.toggleView(null);
					}
					break;
				case '1':
					if (this.$store.manifest && this.textEnabled) {
						this.toggleView('text');
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
					if (this.$store.collection || this.$store.manifest) {
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
					this.fullscreen.toggle();
					break;
				default:
			}

			if (!this.$store.manifest) {
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

			if (!this.doublePageEnabled) {
				return pages[0];
			}

			let newPages;
			if ((pages.length > 1 && forced !== true)
				|| forced === false
			) {
				// There are already multiple pages shown, switch back to single page
				newPages = [pages[1] > 0 ? pages[1] : pages[0]];
			} else {
				// There is only one page shown, add facing page
				newPages = [pages[0], this.$store.getFacingPage(pages[0])].sort();
			}

			this.$store.updateOptions({ pages: newPages });
			return newPages;
		},
		toggleView(name) {
			this.closeControlsPopup();

			const view = name === this.$store.options.view
				&& this.$store.manifest
				&& this.$store.isContainerWidthAtLeast('medium')
				? null
				: name;
			this.$store.updateOptions({ view });
			return view;
		},
	},
};
</script>

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
			v-if="$store.pageCount > 1"
			class="tify-header-column -pagination"
		>
			<h2 class="tify-sr-only">
				{{ $translate('Page') }}
			</h2>

			<div class="tify-header-button-group -page-select">
				<PageSelect />

				<button
					v-if="doublePageEnabled"
					type="button"
					class="tify-header-button"
					:title="$translate('Toggle double-page')"
					:aria-label="$translate('Toggle double-page')"
					:aria-pressed="$store.options.pages.length > 1"
					@click="toggleDoublePage"
				>
					<IconViewModule v-if="$store.isCustomPageView" />
					<!--
					TODO: Remove custom icon once contribution is merged:
					https://github.com/Templarian/MaterialDesign/issues/7760
					-->
					<IconBookOpenBlankOutline v-else />
				</button>
			</div>

			<PaginationButtons v-if="$store.pageCount > 1" />
		</div>

		<div
			ref="controls"
			class="tify-header-column -controls"
		>
			<h2 class="tify-sr-only">
				{{ $translate('View [noun]') }}
			</h2>

			<div
				ref="switchViewSmall"
				class="tify-header-button-group -toggle"
			>
				<button
					type="button"
					:aria-controls="$getId('controls')"
					:aria-expanded="controlsVisible"
					class="tify-header-button"
					:title="$translate('View [noun]')"
					:aria-label="$translate('View [noun]')"
					@click="toggleControlsPopup"
				>
					<IconDotsGrid />
				</button>
			</div>

			<div
				:id="$getId('controls')"
				class="tify-dropdown-content -bottom -mobile-only"
				:class="{ '-visible': controlsVisible }"
			>
				<div class="tify-header-button-group -view">
					<!-- NOTE: This button is hidden on large containers -->
					<button
						v-if="$store.manifest"
						type="button"
						class="tify-header-button -scan"
						:aria-controls="$getId('scan')"
						:aria-expanded="!$store.options.view"
						@click="toggleView(null)"
					>
						<IconImage />
						<span>{{ $translate('Scan [noun]') }}</span>
					</button>

					<button
						v-if="textEnabled"
						type="button"
						class="tify-header-button"
						:aria-controls="$getId('text')"
						:aria-expanded="$store.options.view === 'text'"
						@click="toggleView('text')"
					>
						<IconText />
						<span>{{ $translate('Text') }}</span>
					</button>

					<button
						v-if="$store.manifest"
						type="button"
						class="tify-header-button"
						:aria-controls="$getId('thumbnails')"
						:aria-expanded="$store.options.view === 'thumbnails'"
						@click="toggleView('thumbnails')"
					>
						<IconViewModule />
						<span>{{ $translate('Pages') }}</span>
					</button>

					<button
						v-if="tocEnabled"
						type="button"
						class="tify-header-button"
						:aria-controls="$getId('toc')"
						:aria-expanded="$store.options.view === 'toc'"
						@click="toggleView('toc')"
					>
						<IconTableOfContents />
						<span>{{ $translate('Contents') }}</span>
					</button>

					<button
						type="button"
						class="tify-header-button"
						:aria-controls="$getId('info')"
						:aria-expanded="$store.options.view === 'info'"
						@click="toggleView('info')"
					>
						<IconInformationVariant />
						<span>{{ $translate('Info') }}</span>
					</button>

					<button
						v-if="$store.collection || $store.manifest"
						type="button"
						class="tify-header-button"
						:aria-controls="$getId('export')"
						:aria-expanded="$store.options.view === 'export'"
						@click="toggleView('export')"
					>
						<IconTrayArrowDown />
						<span>{{ $translate('Export [noun]') }}</span>
					</button>

					<button
						v-if="$store.collection"
						type="button"
						class="tify-header-button"
						:aria-controls="$getId('collection')"
						:aria-expanded="$store.options.view === 'collection'"
						@click="toggleView('collection')"
					>
						<IconListBoxOutline />
						<span>{{ $translate('Collection') }}</span>
					</button>
				</div>

				<div class="tify-header-button-group -view">
					<button
						type="button"
						class="tify-header-button -icon-only"
						:aria-controls="$getId('help')"
						:aria-expanded="$store.options.view === 'help'"
						:title="$translate('Help')"
						:aria-label="$translate('Help')"
						@click="toggleView('help')"
					>
						<IconHelpCircleOutline />
						<span>{{ $translate('Help') }}</span>
					</button>

					<button
						v-if="!fullscreen.isFullscreen"
						type="button"
						class="tify-header-button -icon-only"
						:title="$translate('Fullscreen')"
						:aria-label="$translate('Fullscreen')"
						@click="fullscreen.toggle()"
					>
						<IconFullscreen />
						<span>{{ $translate('Fullscreen') }}</span>
					</button>
					<button
						v-else
						type="button"
						class="tify-header-button -icon-only"
						:title="$translate('Exit fullscreen')"
						:aria-label="$translate('Exit fullscreen')"
						@click="fullscreen.toggle()"
					>
						<IconFullscreenExit />
						<span>{{ $translate('Exit fullscreen') }}</span>
					</button>
				</div>

				<PaginationButtons v-if="$store.pageCount > 1" />
			</div>
		</div>
	</header>
</template>
