<template>
	<article
		class="tify"
		tabindex="-1"
	>
		<!-- NOTE: Root element must be focusable for global keyboard events to work -->
		<app-header
			v-if="ready && (collection['@id'] || manifest['@id'])"
			:fulltext-enabled="hasOtherContent"
			:toc-enabled="hasToc"
		/>

		<div
			v-if="ready"
			class="tify-main"
		>
			<template v-if="manifest['@id']">
				<!-- Scan must come first, other views in arbitrary order -->
				<view-scan :id="getId('scan')" />

				<view-fulltext
					v-if="hasOtherContent"
					v-show="options.view === 'fulltext'"
					:id="getId('fulltext')"
				/>
				<view-thumbnails
					v-show="options.view === 'thumbnails'"
					:id="getId('thumbnails')"
				/>
				<view-toc
					v-if="hasToc"
					v-show="options.view === 'toc'"
					:id="getId('toc')"
				/>
				<view-export
					v-show="options.view === 'export'"
					:id="getId('export')"
				/>
			</template>

			<view-info
				v-if="collection['@id'] || manifest['@id']"
				v-show="options.view === 'info'"
				:id="getId('info')"
			/>
			<view-collection
				v-if="collection['@id']"
				v-show="options.view === 'collection'"
				:id="getId('collection')"
			/>
			<view-help
				v-show="options.view === 'help'"
				:id="getId('help')"
			/>
		</div>

		<div
			v-if="loading"
			class="tify-loading"
			:aria-label="translationLoaded ? translate('Loading') : 'Loading'"
		/>

		<section
			v-if="errorHandler.messages.length"
			class="tify-error"
		>
			<button
				type="button"
				class="tify-error-close"
				:aria-label="translate('Dismiss')"
				@click="errorHandler.clear()"
			>
				<icon-close />
			</button>
			<!-- NOTE: Error messages can contain user-controlled content -->
			<div class="tify-error-messages">
				<p v-for="message in errorHandler.messages" :key="message">
					{{ message }}
				</p>
			</div>
		</section>
	</article>
</template>

<script>
import { errorHandler } from './modules/errorHandler';
import { getId } from './modules/id';
import { loading } from './modules/http';
import { translate } from './modules/i18n';
import { canvases, collection, manifest, options, translation } from './modules/store';

export default {
	props: {
		ready: Boolean,
	},
	data() {
		return {
			canvases,
			collection,
			manifest,
			errorHandler,
			loading,
			options,
			translationLoaded: !!translation,
		};
	},
	computed: {
		hasOtherContent() {
			return canvases.value.some((canvas) => 'otherContent' in canvas);
		},
		hasToc() {
			return manifest.structures && manifest.structures.length > 0;
		},
	},
	methods: {
		getId,
		translate,
	},
};
</script>

<style src="./styles/main.scss" lang="scss"></style>
