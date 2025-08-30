<script>
export default {
	props: {
		instance: {
			type: Object,
			required: true,
		},
		isInstanceRemovable: {
			type: Boolean,
			default: true,
		},
	},
	emits: [
		'loadManifest',
		'removeInstance',
		'toggleSidebar',
		'updateManifestUrl',
	],
};
</script>

<template>
	<header :class="{ '-narrow': !instance.tify }">
		<button
			v-if="instance.tify"
			type="button"
			aria-label="Toggle sidebar"
			:aria-controls="`sidebar${instance.id}`"
			:aria-expanded="instance.sidebarOpen"
			@click="$emit('toggleSidebar')"
		>
			<IconMenu v-if="!instance.sidebarOpen" />
			<IconBackburger v-else />
		</button>

		<form @submit.prevent="$emit('loadManifest')">
			<!-- NOTE: ID required for local input history -->
			<input
				:id="`manifest${instance.id}`"
				ref="input"
				type="url"
				:aria-label="$translate('IIIF manifest URL', instance)"
				:placeholder="$translate('IIIF manifest URL', instance)"
				:value="instance.manifestUrl"
				@input="$emit('updateManifestUrl', $event.target.value)"
				@focus="$event.target.select()"
			>
			<button
				v-show="instance.manifestUrl && instance.manifestUrl !== instance.tify?.options.manifestUrl"
				type="submit"
				class="submit"
				:aria-label="$translate('Load manifest', instance)"
			>
				<IconArrowRight />
			</button>
			<button
				v-if="isInstanceRemovable"
				type="button"
				class="remove"
				:aria-label="$translate('Remove instance', instance)"
				@click="$emit('removeInstance')"
			>
				<IconClose />
			</button>
		</form>
	</header>
</template>

<style lang="scss" scoped>
@import '../imports';

button {
	@extend %button;
	box-shadow: none;
	color: $link-color;

	// Hide remove button if submit button is visible
	&:not([style*='display: none']) + button {
		display: none;
	}
}

form {
	display: flex;
	flex: 1 0 2rem;
	gap: .25rem;
}

header {
	align-items: center;
	background: $header-bg;
	border-bottom: 1px solid $border-color;
	display: flex;
	gap: .25rem;
	padding: .25rem;
	position: relative;
	z-index: 10;

	&.-narrow {
		border: 1px solid $border-color;
		border-radius: $br;
		left: 50%;
		max-width: calc(100% - 2rem);
		position: absolute;
		top: 6rem;
		transform: translate(-50%);
		width: 41.5rem;
	}
}

[type=url] {
	background: none;
	background-clip: padding-box, border-box;
	background-origin: border-box;
	border: 1px solid transparent;
	border-radius: $br;
	color: $link-color;
	flex: 1;
	outline: none;
	padding: calc(.25rem - 1px);

	&:focus,
	&:hover {
		background-image:
			linear-gradient($header-bg, $header-bg),
			linear-gradient($header-bg calc(100% - .25rem), $link-color calc(100% - .25rem));
		color: $link-hover-color;
	}

	&::placeholder {
		color: $link-color;
		text-align: center;
	}

	&:focus::placeholder {
		color: transparent;
	}
}
</style>
