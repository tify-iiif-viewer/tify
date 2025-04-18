<script>
import sampleManifests from '../sampleManifests';

export default {
	props: {
		instance: {
			type: Object,
			required: true,
		},
	},
	emits: [
		'load',
	],
	data() {
		return {
			sampleManifests,
		};
	},
};
</script>

<template>
	<section :aria-description="$t(`Sample IIIF Manifests`, instance)">
		<ul>
			<li v-for="manifest in sampleManifests" :key="manifest.url">
				<button
					type="button"
					@click="$emit('load', manifest.url)"
				>
					<img
						:src="`thumbnails/${manifest.url.replace(/[^\w]/g, '')}.avif`"
						alt=""
						width="240"
						height="240"
						loading="lazy"
					>
					<span v-if="manifest.type === 'collection'" class="badge">
						{{ $t('Collection', instance) }}
					</span>
					<span class="title">
						{{ manifest.title }}
					</span>
				</button>
			</li>
		</ul>
	</section>
</template>

<style lang="scss" scoped>
@import '../../styles/util/settings';
@import '../../styles/functions/*';
@import '../../styles/mixins/*';
@import '../../styles/extends/*';

section {
	padding: .5rem;
	width: 100%;
	z-index: 0;

	@container (width > 23rem) {
		max-width: 43rem
	}
}

ul {
	display: flex;
	flex-wrap: wrap;
	gap: .25rem;
	list-style: none;
	justify-content: center;

	@container (width > 23rem) {
		gap: .5rem;
	}
}

li {
	margin: 0 0 .25rem;

	+ li {
		// margin-left: -4rem;
	}
}

img {
	transition: transform 5s;
}

button {
	@extend %button;
	box-shadow: 0 0 0 1px $border-color;
	justify-content: flex-start;
	overflow: hidden;
	padding: 0;
	position: relative;
	text-align: left;
	transition: box-shadow .2s;
	width: 100%;

	@include hover {
		color: $link-color;
		z-index: 1;

		img {
			transform: scale(1.2);
		}
	}
}

.title {
	background: #0007;
	backdrop-filter: $blur;
	border-radius: $br 0 0 $br;
	color: #fff;
	display: block;
	font-weight: bold;
	padding: .25rem .5rem;
	position: absolute;
	inset: auto 0 .75rem 1.5rem;
	transition: background .2s, color .2s;

	button:focus &,
	button:hover & {
		background: $link-color;
		color: $text-color-inverted;
	}
}

.badge {
	font-weight: bold;
	letter-spacing: .1em;
	text-transform: uppercase;
	background: $text-color-inverted;
	color: $text-color;
	border-radius: $br;
	display: inline-flex;
	font-size: $font-size-small;
	letter-spacing: .1em;
	padding: 0 .5rem;
	position: absolute;
	inset: .5rem .5rem auto auto;
	text-transform: uppercase;
}
</style>
