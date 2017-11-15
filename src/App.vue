<template>
	<div class="tify-app">
		<app-header
			v-if="$root.manifest"
			:fulltextEnabled="hasOtherContent"
			:tocEnabled="hasToc"
		/>

		<div v-if="$root.manifest" class="tify-app_main">
			<scan/>
			<fulltext v-if="hasOtherContent" v-show="$root.params.view === 'fulltext'"/>
			<toc v-if="hasToc" v-show="$root.params.view === 'toc'"/>
			<thumbnails v-show="$root.params.view === 'thumbnails'"/>
			<info v-show="$root.params.view === 'info'"/>
			<export v-show="$root.params.view === 'export'"/>
			<help v-show="$root.params.view === 'help'"/>
		</div>

		<div
			v-if="$root.loading"
			class="tify-app_loading"
			:class="{'-centered' : !$root.manifest}"
		>
			<span class="tify-sr-only">{{ 'Loading'|trans }}</span>
		</div>

		<div v-if="$root.error" class="tify-app_error">
			<button class="tify-app_error-close" @click="$root.error = ''">
				<icon name="close"/>
			</button>
			<span v-html="$root.error"/>
		</div>
	</div>
</template>

<script>
	import AppHeader from '@/components/Header';
	import Export from '@/views/Export';
	import Fulltext from '@/views/Fulltext';
	import Help from '@/views/Help';
	import Info from '@/views/Info';
	import Scan from '@/views/Scan';
	import Thumbnails from '@/views/Thumbnails';
	import Toc from '@/views/Toc';

	export default {
		components: {
			AppHeader,
			Export,
			Help,
			Info,
			Scan,
			Thumbnails,
			Toc,
			Fulltext,
		},
		computed: {
			hasOtherContent() {
				return this.$root.canvases.some(canvas => 'otherContent' in canvas);
			},
			hasToc() {
				return !!(this.$root.manifest.structures && this.$root.manifest.structures.length);
			},
		},
	};
</script>

<style src="@/styles/main.scss" lang="scss"></style>
