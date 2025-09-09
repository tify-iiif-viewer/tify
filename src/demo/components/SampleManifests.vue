<script>
import { filenamifyUrl } from '../modules/filenamify';

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
			manifests,
		};
	},
	methods: {
		filenamifyUrl,
	},
};
</script>

<template>
	<ul>
		<li
			v-for="manifest in manifests"
			:key="manifest.url"
		>
			<a
				:href="`?manifest=${manifest.url}`"
				@click.prevent="$emit('load', manifest.url)"
			>
				<img
					width="240"
					alt=""
					height="240"
					loading="lazy"
					:src="`thumbnails/${filenamifyUrl(manifest.url)}.avif`"
				>
				<span class="title">
					<span class="title-text">
						<b v-if="manifest.type === 'collection'">
							{{ $translate('Collection', instance) }}
							<br>
						</b>
						{{ manifest.title }}
					</span>
				</span>
			</a>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
@import '../imports';

a {
	@extend %button;
	color: $text-color-inverted;
	overflow: hidden;
	padding: 0;
	position: relative;
	text-align: left;

	&:not(:disabled) {
		&:focus,
		&:hover {
			color: $text-color-inverted;
		}
	}
}

img {
	filter: grayscale(.1);
	margin: -1px;
	opacity: .9;
	transition: transform calc($td * 2);

	button:focus &,
	button:hover & {
		filter: none;
		opacity: 1;
		transform: scale(1.1);
		transition-duration: $td;
	}
}

ul {
	display: flex;
	flex-wrap: wrap;
	gap: .5rem;
	justify-content: center;
	list-style: none;
	padding: .5rem;
	width: 100%;
	z-index: 0;

	@container (width > 23rem) {
		max-width: 43rem;
	}
}

.title {
	font-size: $font-size-small;
	inset: auto 25% .5rem .5rem;
	line-height: 1rem;
	position: absolute;
	z-index: 1;
}

.title-text {
	background: $link-color;
	border-radius: $br;
	box-decoration-break: clone;
	padding: .5em .75em;

	b {
		font-weight: bold;
	}

	button:focus &,
	button:hover & {
		background: $link-hover-color;
	}
}
</style>
