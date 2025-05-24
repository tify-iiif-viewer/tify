<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import filenamifyUrl from 'filenamify-url';

import manifests from '../manifests';

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
			filenamifyUrl,
			manifests,
		};
	},
};
</script>

<template>
	<ul>
		<li v-for="manifest in manifests" :key="manifest.url">
			<button
				type="button"
				@click="$emit('load', manifest.url)"
			>
				<img
					:src="`thumbnails/${filenamifyUrl(manifest.url)}.avif`"
					width="240"
					alt=""
					height="240"
					loading="lazy"
				>
				<span v-if="manifest.type === 'collection'" class="badge">
					{{ $translate('Collection', instance) }}
				</span>
				<span class="title">
					<span class="title-text">
						{{ manifest.title }}
					</span>
				</span>
			</button>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
@import '../../styles/util/settings';
@import '../../styles/functions/*';
@import '../../styles/mixins/*';
@import '../../styles/extends/*';

ul {
	display: flex;
	flex-wrap: wrap;
	gap: .25rem;
	justify-content: center;
	list-style: none;
	padding: .5rem;
	width: 100%;
	z-index: 0;

	@container (width > 23rem) {
		gap: .5rem;
		max-width: 43rem;
	}
}

li {
	margin: 0 0 .25rem;
}

img {
	filter: grayscale(.2);
	opacity: .9;
	transition: all .4s;

	@at-root {
		button {
			@include hover {
				img {
					filter: none;
					opacity: 1;
					transform: scale(1.1);
				}
			}
		}
	}
}

button {
	@extend %button;
	background: $link-color !important;
	overflow: hidden;
	padding: 0;
	position: relative;
	text-align: left;
}

.title {
	inset: auto 25% .5rem .5rem;
	position: absolute;
	transition: transform .4s;
}

.title-text {
	background: $link-color;
	border-radius: $br;
	box-decoration-break: clone;
	color: $text-color-inverted;
	padding: .35em .5rem;
}

.badge {
	background: $text-color-inverted;
	border-radius: $br;
	color: $text-color;
	font-size: $font-size-small;
	font-weight: bold;
	letter-spacing: .1em;
	line-height: 1;
	padding: .5em .75em;
	position: absolute;
	right: .5rem;
	text-transform: uppercase;
	top: .5rem;
}
</style>
