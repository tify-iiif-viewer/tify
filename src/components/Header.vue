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
			</div>

			<div class="tify-header_button-group">
				<button
					class="tify-header_button"
					:disabled="$root.params.page === 1"
					:title="'First page'|trans"
					@click="$root.setPage(1)"
				>
					<i class="tify-icon">first_page</i>
					<span class="tify-sr-only">{{ 'First page'|trans }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="$root.params.page === 1"
					:title="'Previous section'|trans"
					@click="goToPreviousSection()"
				>
					<i class="tify-icon">skip_previous</i>
					<span class="tify-sr-only">{{ 'Previous section'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="$root.params.page === 1"
					:title="'Previous page'|trans"
					@click="$root.setPage($root.params.page - 1)"
				>
					<i class="tify-icon">navigate_before</i>
					<span class="tify-sr-only">{{ 'Previous page'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="$root.params.page === $root.pageCount"
					:title="'Next page'|trans"
					@click="$root.setPage($root.params.page + 1)"
				>
					<i class="tify-icon">navigate_next</i>
					<span class="tify-sr-only">{{ 'Next page'|trans }}</span>
				</button>

				<button
					v-if="structures && structures.length"
					class="tify-header_button"
					:disabled="$root.params.page >= lastSection.firstPage"
					:title="'Next section'|trans"
					@click="goToNextSection()"
				>
					<i class="tify-icon">skip_next</i>
					<span class="tify-sr-only">{{ 'Next section'|trans }}</span>
				</button>

				<button
					class="tify-header_button"
					:disabled="$root.params.page === $root.pageCount"
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
					{{ 'Menu'|trans }}
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
				currentSectionIndex: 0,
				sections: [],
			};
		},
		computed: {
			currentSection() {
				if (this.currentSectionIndex < this.sections.length) {
					return this.sections[this.currentSectionIndex];
				}
				return {};
			},
			lastSection() {
				return this.sections[this.sections.length - 1];
			},
			structures() {
				return this.$root.manifest.structures;
			},
			titles() {
				return this.$root.iiifFormat(this.$root.manifest.label);
			},
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.page': function () {
				this.updateCurrentSectionIndex();
			},
		},
		methods: {
			closeControlsPopup() {
				this.controlsVisible = false;
			},
			goToNextSection() {
				let sectionIndex = this.currentSectionIndex + 1;
				while (
					this.sections[sectionIndex]
					&& this.currentSection.firstPage >= this.sections[sectionIndex].firstPage
				) sectionIndex += 1;
				this.$root.setPage(this.sections[sectionIndex].firstPage);
			},
			goToPreviousSection() {
				let sectionIndex = this.currentSectionIndex - 1;
				while (
					this.sections[sectionIndex]
					&& this.currentSection.firstPage <= this.sections[sectionIndex].firstPage
				) sectionIndex -= 1;
				this.$root.setPage(this.sections[sectionIndex].firstPage);
			},
			toggleControlsPopup() {
				this.controlsVisible = !this.controlsVisible;
			},
			toggleView(name) {
				const view = (name === this.$root.params.view && !this.$root.isMobile() ? '' : name);
				this.$root.updateParams({ view });
			},
			updateCurrentSectionIndex() {
				// Find the last section containing the current page
				// Setting default value for pages that are not part of a section
				let newSectionIndex = this.sections.length;
				this.sections.forEach((section, index) => {
					if (
						this.$root.params.page >= section.firstPage
						&& this.$root.params.page <= section.lastPage
					) {
						newSectionIndex = index;
					}
				});
				this.currentSectionIndex = newSectionIndex;
			},
		},
		created() {
			if (!this.$root.manifest.structures) return;

			const sections = [];
			this.$root.manifest.structures.forEach((structure) => {
				const firstCanvasId = structure.canvases[0];
				const firstPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === firstCanvasId) + 1;
				const lastCanvasId = structure.canvases[structure.canvases.length - 1];
				const lastPage = this.$root.canvases.findIndex(canvas => canvas['@id'] === lastCanvasId) + 1;
				sections.push({ firstPage, lastPage });
			});
			this.sections = sections;

			this.updateCurrentSectionIndex();
		},
	};
</script>
