<template>
	<header class="tify-header">
		<div class="tify-header_column">
			<h1 class="tify-header_title" :title="manifest.label">
				{{ manifest.label }}
			</h1>
		</div>

		<div class="tify-header_column">
			<button
				class="tify-header_toggle-controls"
				v-click-outside="closeControlsPopup"
				@click="toggleControlsPopup"
			>
				<i class="tify-icon">menu</i>
				{{ 'Panel'|trans }}
			</button>

			<div class="tify-header_button-group" :class="{ '-visible': controlsVisible }">
				<button
					class="tify-header_button -scan"
					:class="{ '-active': panel === 'scan' }"
					@click="$emit('togglePanel', 'scan')"
				>
					<i class="tify-icon">photo</i>
					{{ 'Scan'|trans }}
				</button>
				<!-- TODO: Only show transcription button and panel if actually available -->
				<button
					v-if="false"
					class="tify-header_button"
					:class="{ '-active': panel === 'transcript' }"
					@click="$emit('togglePanel', 'transcript')"
				>
					<i class="tify-icon">subject</i>
					{{ 'Transcript'|trans }}
				</button>
				<button
					class="tify-header_button"
					:class="{ '-active': panel === 'thumbnails' }"
					@click="$emit('togglePanel', 'thumbnails')"
				>
					<i class="tify-icon">view_module</i>
					{{ 'Pages'|trans }}
				</button>
				<button
					v-if="manifest.structures"
					class="tify-header_button"
					:class="{ '-active': panel === 'toc' }"
					@click="$emit('togglePanel', 'toc')"
				>
					<i class="tify-icon">toc</i>
					{{ 'Contents'|trans }}
				</button>
				<button
					class="tify-header_button"
					:class="{ '-active': panel === 'metadata' }"
					@click="$emit('togglePanel', 'metadata')"
				>
					<i class="tify-icon">info_outline</i>
					{{ 'Metadata'|trans }}
				</button>
				<button
					class="tify-header_button -help"
					:class="{ '-active': panel === 'help' }"
					:title="$options.filters.trans('Help')"
					@click="$emit('togglePanel', 'help')"
				>
					<i class="tify-icon">help_outline</i>
					{{ 'Help'|trans }}
				</button>
			</div>
		</div>
	</header>
</template>

<script>
	export default {
		props: [
			'manifest',
			'panel',
		],
		data() {
			return {
				controlsVisible: false,
			};
		},
		methods: {
			closeControlsPopup() {
				this.controlsVisible = false;
			},
			toggleControlsPopup() {
				this.controlsVisible = !this.controlsVisible;
			},
		},
	};
</script>
