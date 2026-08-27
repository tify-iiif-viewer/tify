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
		availableViews() {
			return [null, ...this.$store.options.views].filter((name) => {
				switch (name) {
					case null:
						return !!this.$store.manifest;
					case 'text':
						return this.textEnabled;
					case 'thumbnails':
						return !!this.$store.manifest;
					case 'toc':
						return this.tocEnabled;
					case 'export':
						return !!this.$store.collection || !!this.$store.manifest;
					case 'collection':
						return !!this.$store.collection;
					default:
						return true;
				}
			});
		},
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
		this.$api.expose(this.fullscreen.toggle, 'toggleFullscreen');
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

			const number = Number(event.key);
			if (number <= this.availableViews.length) {
				this.toggleView(this.availableViews[number]);
			}

			switch (event.key) {
				case 'b':
					if (this.$store.manifest) {
						this.toggleDoublePage();
					}
					break;
				case 'f':
					this.fullscreen.toggle();
					break;
				case 'h':
					this.toggleView('help');
					break;
				default:
			}

			if (!this.$store.manifest) {
				return;
			}

			switch (event.key) {
				case 'q':
				case ',':
					this.$store.goToPreviousPage();
					break;
				case 'e':
				case '.':
					this.$store.goToNextPage();
					break;
				case 'Q':
					this.$store.goToFirstPage();
					break;
				case 'E':
					this.$store.goToLastPage();
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

			if (name !== 'help' && !this.availableViews.includes(name)) {
				return false;
			}

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
					:class="{ '-vertical': $store.isVertical }"
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
					<template
						v-for="view in availableViews"
						:key="view"
					>
						<button
							type="button"
							:class="`tify-header-button -${view || 'media'}`"
							:aria-controls="$getId(view || 'media')"
							:aria-expanded="$store.options.view === view"
							@click="toggleView(view)"
						>
							<template v-if="!view">
								<!-- NOTE: This button is hidden on large containers -->
								<IconImageArea />
								<span class="tify-header-button-label">{{ $translate('Media') }}</span>
							</template>
							<template v-if="view === 'text'">
								<IconText />
								<span class="tify-header-button-label">{{ $translate('Text') }}</span>
							</template>
							<template v-else-if="view === 'thumbnails'">
								<IconViewModule />
								<span class="tify-header-button-label">{{ $translate('Pages') }}</span>
							</template>
							<template v-else-if="view === 'toc'">
								<IconTableOfContents />
								<span class="tify-header-button-label">{{ $translate('Contents') }}</span>
							</template>
							<template v-else-if="view === 'info'">
								<IconInformationVariant />
								<span class="tify-header-button-label">{{ $translate('Info') }}</span>
							</template>
							<template v-else-if="view === 'export'">
								<IconTrayArrowDown />
								<span class="tify-header-button-label">{{ $translate('Export [noun]') }}</span>
							</template>
							<template v-else-if="view === 'collection'">
								<IconListBoxOutline />
								<span class="tify-header-button-label">{{ $translate('Collection') }}</span>
							</template>
						</button>
					</template>
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
						<span class="tify-header-button-label">{{ $translate('Help') }}</span>
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
						<span class="tify-header-button-label">{{ $translate('Fullscreen') }}</span>
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
						<span class="tify-header-button-label">{{ $translate('Exit fullscreen') }}</span>
					</button>
				</div>

				<PaginationButtons v-if="$store.pageCount > 1" />
			</div>
		</div>
	</header>
</template>
