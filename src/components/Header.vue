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
						'-warning': $root.customPageViewActive,
					}"
					:title="'Toggle double-page'|trans"
					@click="toggleDoublePage"
				>
					<icon v-if="$root.customPageViewActive" name="view_module"/>
					<icon v-else name="import_contacts"/>
					<span class="tify-sr-only">{{ 'Toggle double-page'|trans }}</span>
				</button>
			</div>

			<Pagination :keyboard="true"/>
		</div>

		<div class="tify-header_column -controls-toggle">
			<div class="tify-header_button-group" ref="switchViewSmall">
				<button
					class="tify-header_button"
					v-click-outside="closeControlsPopup"
					@click="toggleControlsPopup"
				>
					<icon name="menu"/>
					{{ 'View'|trans }}
				</button>
			</div>
		</div>

		<div class="tify-header_column -controls" :class="{ '-visible': controlsVisible }">
			<div class="tify-header_button-group -view">
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
					class="tify-header_button -icon-only"
					:class="{ '-active': $root.params.view === 'help' }"
					:title="$options.filters.trans('Help')"
					@click="toggleView('help')"
				>
					<icon name="help_outline"/>
					{{ 'Help'|trans }}
				</button>
			</div>

			<div class="tify-header_button-group -view" v-if="fullscreenSupported">
				<button
					v-if="!fullscreenActive"
					class="tify-header_button -icon-only"
					:title="'Fullscreen'|trans"
					@click="toggleFullscreen"
				>
					<icon name="fullscreen"/>
					{{ 'Fullscreen'|trans }}
				</button>
				<button
					v-else
					class="tify-header_button -icon-only"
					:title="'Exit fullscreen'|trans"
					@click="toggleFullscreen"
				>
					<icon name="fullscreen_exit"/>
					{{ 'Exit fullscreen'|trans }}
				</button>
			</div>
			<Pagination class="tify-header_button-group -popup" />
		</div>
	</header>
</template>

<script>
import PageSelect from '@/components/PageSelect';

import keyboard from '@/mixins/keyboard';
import Pagination from '@/components/Pagination';

export default {
	components: {
		Pagination,
		PageSelect,
	},
	mixins: [
		keyboard,
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
		};
	},
	computed: {
		fullscreenSupported() {
			return document.fullscreenElement === null
					|| document.msFullscreenElement === null
					|| document.webkitFullscreenElement === null;
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
			if (this.fullscreenActive) {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.mozCancelFullScreen) { // Firefox
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
					document.webkitExitFullscreen();
				} else if (document.msExitFullscreen) { // IE/Edge
					document.msExitFullscreen();
				}
				return;
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
		},
		toggleFullscreenActive() {
			this.fullscreenActive = !this.fullscreenActive;
		},
		toggleView(name) {
			const view = (name === this.$root.params.view && !this.$root.isMobile() ? '' : name);
			this.$root.updateParams({ view });
		},
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
			case 'f':
				this.toggleFullscreen();
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
