<script>
// TODO: Store current video position in URL query
// TODO: Add keyboard controls
// TODO: Add support for selection from multiple media files

import { useMediaControls } from '@vueuse/core';
import { useTemplateRef } from 'vue';

export default {
	props: {
		src: {
			required: true,
			type: String,
		},
		format: {
			required: true,
			type: String,
		},
		hasImage: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			currentSubtitle: null,
			media: useMediaControls(useTemplateRef('av')),
			mouseInterval: null,
			mouseMoving: true,
			rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
		};
	},
	computed: {
		type() {
			return this.format?.split('/')[0];
		},
		subtitles() {
			// TODO: There may be other subtitle annotations
			const body = this.$store.manifest
				.items[this.$store.options.pages[0] - 1]
				.annotations?.[0]
				.items?.[0]
				.body;

			return body ? body.items || [body] : [];
		},
	},
	watch: {
		currentSubtitle(currentSubtitle) {
			Object.values(this.$refs.av.textTracks).forEach((track) => {
				// eslint-disable-next-line no-param-reassign
				track.mode = track.language === currentSubtitle?.language ? 'showing' : 'disabled';
			});
		},
	},
	beforeUnmount() {
		clearInterval(this.mouseInterval);
	},
	mounted() {
		window.addEventListener('mousemove', this.onMouseMove);
	},
	unmounted() {
		window.removeEventListener('mousemove', this.onMouseMove);
	},
	methods: {
		formatTime(seconds) {
			const h = Math.floor(seconds / 3600);
			const m = Math.floor((seconds % 3600) / 60);
			const s = Math.floor(seconds % 60);
			return [
				...this.media.duration > 3600 ? [h.toString().padStart(2, '0')] : [],
				m.toString().padStart(2, '0'),
				s.toString().padStart(2, '0'),
			].join(':');
		},
		onMouseMove() {
			clearTimeout(this.mouseInterval);

			this.mouseMoving = true;

			this.mouseInterval = setInterval(() => {
				this.mouseMoving = this.$store.options.view || this.media.paused;
			}, 2000);
		},
	},
};
</script>

<template>
	<div
		class="tify-player"
		:class="`
			-${type}
			${mouseMoving || media.paused ? '-mousing' : ''}
			${media.playing || media.waiting ? '-playing' : ''}
			${hasImage ? '-bottom' : ''}
		`"
		@keydown.space.prevent="media.playing = !media.playing"
	>
		<component
			:is="type"
			ref="av"
			class="tify-player-av"
			:poster="$store.getThumbnailUrl($store.options.pages[0], 0)"
			preload="metadata"
			crossorigin="anonymous"
		>
			<source
				:src="src"
				:type="format"
			>
			<track
				v-for="subtitle in subtitles"
				:key="subtitle.id"
				kind="captions"
				:srclang="subtitle.language"
				:src="subtitle.id"
			/>
		</component>
		<!-- TODO: Add loading indicator for media.waiting, and check media.stalled -->
		<button
			v-if="type === 'video' && !hasImage && !media.waiting"
			class="tify-player-overlay"
			type="button"
			aria-hidden
			@click="media.playing = !media.playing; onMouseMove()"
		>
			<IconPlay v-if="media.currentTime < 1" />
		</button>

		<div class="tify-player-controls">
			<div>
				<button
					type="button"
					class="tify-player-play-pause"
					:aria-label="$translate(media.paused ? 'Play [verb]' : 'Pause [verb]')"
					:disabled="media.waiting"
					@click="media.playing = !media.playing"
				>
					<IconLoading
						v-if="media.waiting"
						class="-spin"
					/>
					<IconPause v-else-if="media.playing" />
					<IconPlay v-else />
				</button>
				<input
					v-model.number="media.currentTime"
					type="range"
					class="tify-player-seekbar"
					min="0"
					:max="media.duration"
					step="any"
					:aria-label="$translate('Current time')"
					:style="`--value: ${media.currentTime / media.duration * 100}%`"
				/>
				<span class="tify-player-time">
					<span class="tify-player-elapsed">{{ formatTime(media.currentTime) }}</span>
					<span class="tify-player-duration"> / {{ formatTime(media.duration) }}</span>
				</span>

				<AppDropdown
					class="tify-player-select -rate"
					alignment="center"
					position="top"
					shortcut="r"
				>
					<template #button>
						<span class="tify-sr-only">{{ $translate('Playback rate') }}</span>
						<IconPlaySpeed />
						<span
							v-if="media.rate !== 1"
							class="tify-player-select-badge"
						>
							{{ media.rate.toLocaleString($store.options.language) }}x
						</span>
					</template>

					<h3 class="tify-player-select-title">
						{{ $translate('Playback rate') }}
					</h3>
					<ol class="tify-link-list">
						<li
							v-for="rate in rates"
							:key="rate"
						>
							<button
								type="button"
								:aria-pressed="rate === media.rate"
								@click="media.rate = rate"
							>
								{{ rate === 1 ? $translate('Normal') : `${rate.toLocaleString($store.options.language)}x` }}
							</button>
						</li>
					</ol>
				</AppDropdown>

				<AppDropdown
					v-if="subtitles.length"
					class="tify-player-select -captions"
					alignment="center"
					position="top"
					shortcut="c"
				>
					<template #button>
						<span class="tify-sr-only">{{ $translate('Closed Captions') }}</span>
						<IconClosedCaption v-if="currentSubtitle" />
						<IconClosedCaptionOutline v-else />
					</template>

					<h3 class="tify-player-select-title">
						{{ $translate('Closed Captions') }}
					</h3>
					<ol class="tify-link-list">
						<li
							v-for="subtitle in subtitles"
							:key="subtitle.id"
						>
							<button
								type="button"
								:aria-pressed="subtitle === currentSubtitle"
								@click="currentSubtitle = subtitle"
							>
								{{ $store.localize(subtitle.label) || subtitle.language }}
							</button>
						</li>
						<li>
							<button
								type="button"
								:aria-pressed="!currentSubtitle"
								@click="currentSubtitle = null"
							>
								{{ $translate('None') }}
							</button>
						</li>
					</ol>
				</AppDropdown>
			</div>
			<div>
				<button
					type="button"
					class="tify-player-mute"
					:aria-label="$translate('Toggle mute')"
					:disabled="media.volume === 0"
					@click="media.muted = !media.muted"
				>
					<IconVolumeVariantOff v-if="media.muted" />
					<IconVolumeLow v-else-if="media.volume < .34" />
					<IconVolumeMedium v-else-if="media.volume < .67" />
					<IconVolumeHigh v-else />
				</button>
				<input
					v-model.number="media.volume"
					type="range"
					class="tify-player-volume"
					min="0"
					max="1"
					step="0.01"
					:aria-label="$translate('Volume')"
					:style="`--value: ${media.volume * 100}%`"
					@input="media.muted = media.volume === 0"
				/>
			</div>
		</div>
	</div>
</template>
