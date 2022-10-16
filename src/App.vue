<template>
	<!-- NOTE: Root element must be focusable for global keyboard events to work -->
	<article class="tify" tabindex="-1">
		<app-header
			v-if="$root.ready && ($root.collection || $root.manifest)"
			:fulltextEnabled="hasOtherContent"
			:tocEnabled="hasToc"
		/>

		<div v-if="$root.ready" class="tify-main">
			<template v-if="$root.manifest">
				<!-- Scan must come first, other views in arbitrary order -->
				<view-scan
					:id="$root.getId('scan')"
				/>

				<view-fulltext
					v-if="hasOtherContent"
					v-show="$root.options.view === 'fulltext'"
					:id="$root.getId('fulltext')"
				/>
				<view-thumbnails
					v-show="$root.options.view === 'thumbnails'"
					:id="$root.getId('thumbnails')"
				/>
				<view-toc
					v-if="hasToc"
					v-show="$root.options.view === 'toc'"
					:id="$root.getId('toc')"
				/>
				<view-export
					v-show="$root.options.view === 'export'"
					:id="$root.getId('export')"
				/>
			</template>

			<view-info
				v-if="$root.collection || $root.manifest"
				v-show="$root.options.view === 'info'"
				:id="$root.getId('info')"
			/>
			<view-collection
				v-if="$root.collection"
				v-show="$root.options.view === 'collection'"
				:id="$root.getId('collection')"
			/>
			<view-help
				v-show="$root.options.view === 'help'"
				:id="$root.getId('help')"
			/>
		</div>

		<div
			v-if="$root.loading"
			class="tify-loading"
			:aria-label="$root.translation ? $root.translate('Loading') : 'Loading'"
		/>

		<div v-if="$root.error" class="tify-error">
			<button class="tify-error-close" @click="$root.error = ''">
				<icon-close/>
			</button>
			<!-- NOTE: Error messages can contain user-controlled content -->
			<span>{{ $root.error }}</span>
		</div>
	</article>
</template>

<script>
import AppHeader from './components/AppHeader';
import ViewCollection from './components/ViewCollection';
import ViewExport from './components/ViewExport';
import ViewFulltext from './components/ViewFulltext';
import ViewHelp from './components/ViewHelp';
import ViewInfo from './components/ViewInfo';
import ViewScan from './components/ViewScan';
import ViewThumbnails from './components/ViewThumbnails';
import ViewToc from './components/ViewToc';

export default {
	components: {
		AppHeader,
		ViewCollection,
		ViewExport,
		ViewFulltext,
		ViewHelp,
		ViewInfo,
		ViewScan,
		ViewThumbnails,
		ViewToc,
	},
	computed: {
		hasOtherContent() {
			return this.$root.manifest && this.$root.canvases.some((canvas) => 'otherContent' in canvas);
		},
		hasToc() {
			return this.$root.manifest && this.$root.manifest.structures && this.$root.manifest.structures.length;
		},
	},
	beforeDestroy() {
		window.removeEventListener('popstate', this.$root.updateOptionsFromUrlQuery);
	},
};
</script>

<style src="./styles/main.scss" lang="scss"></style>
