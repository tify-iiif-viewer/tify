<script>
import { reactive } from 'vue';

import Instance from './Instance.class';

import ColorModeSwitcher from './components/ColorModeSwitcher.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import ManifestForm from './components/ManifestForm.vue';
import SampleManifests from './components/SampleManifests.vue';
import TifyLogo from './components/TifyLogo.vue';

export default {
	components: {
		ColorModeSwitcher,
		LanguageSwitcher,
		ManifestForm,
		SampleManifests,
		TifyLogo,
	},
	data() {
		return {
			instances: [],
		};
	},
	computed: {
		env() {
			return ENV;
		},
	},
	mounted() {
		// Restore state from URL query
		const params = (new URL(window.location)).searchParams;
		params.forEach((url, key) => {
			if (!key.startsWith('manifest') && key !== 'iiif-content') {
				return;
			}

			const id = key === 'iiif-content' ? '' : key.replace('manifest', '');

			const instance = this.addInstance({
				id,
				language: params.get(`language${id}`),
				manifestUrl: url,
				urlQueryKey: `tify${id}`,
			});

			this.$nextTick(() => {
				instance.loadManifest();
			});
		});

		if (!this.instances.length) {
			this.addInstance({
				language: params.get('language'),
			});
		}
	},
	methods: {
		addInstance(options = {}) {
			const realOptions = { ...options };
			if (!options.id) {
				realOptions.id = this.getInstanceId();
			}

			// eslint-disable-next-line no-new
			const instance = reactive(new Instance(realOptions));
			this.instances.push(instance);
			return instance;
		},
		getInstanceId() {
			let id = '';
			// eslint-disable-next-line no-loop-func
			while (this.instances.find((i) => i.id === id)) {
				id = ((parseInt(id, 10) || 1) + 1).toString();
			}
			return id;
		},
		removeInstance(instance) {
			instance.destroy();

			if (this.instances.length > 1) {
				this.instances.splice(this.instances.findIndex((i) => i.id === instance.id), 1);
			}
		},
	},
};
</script>

<template>
	<div class="app">
		<section
			v-for="instance in instances"
			:key="instance.id"
			class="instance"
			:style="`color-scheme: ${instance.colorMode === 'auto' ? 'light dark' : instance.colorMode}`"
		>
			<header v-if="instance.tify" class="header">
				<button
					type="button"
					class="button"
					aria-label="Toggle sidebar"
					:aria-controls="`sidebar${instance.id}`"
					:aria-expanded="instance.sidebarOpen"
					style="font-size: 1rem; height: 1.5rem; margin-right: .25rem; padding: .125rem; width: 1.5rem"
					@click="instance.sidebarOpen = !instance.sidebarOpen"
				>
					<i v-if="!instance.sidebarOpen" class="wiggle">
						🥚
					</i>
					<i v-else>
						🐰
					</i>
				</button>

				<ManifestForm
					v-if="instance.tify"
					v-model="instance.manifestUrl"
					:instance="instance"
					@load="instance.loadManifest()"
				/>
			</header>

			<main class="main">
				<nav
					:id="`sidebar${instance.id}`"
					class="sidebar"
					:hidden="!instance.sidebarOpen && instance.tify"
				>
					<div class="sidebar-controls">
						<div class="logo">
							<TifyLogo />
						</div>

						<ul
							style="
								display: flex;
								gap: .5rem;
								list-style: none;
								margin-bottom: .5rem;
							"
						>
							<li style="display: flex; gap: 1px; flex: 1">
								<button
									type="button"
									class="button"
									style="
										border-radius: 2px 0 0 2px;
										padding: .125rem;
										width: 100%;
									"
									:aria-label="$t('Add instance', instance)"
									:title="$t('Add instance', instance)"
									@click="addInstance()"
								>
									<IconCardPlusOutline />
								</button>
								<button
									type="button"
									class="button"
									:disabled="!instance.tify && instances.length < 2"
									style="
										border-radius: 0 2px 2px 0;
										padding: .125rem;
										width: 100%;
									"
									:aria-label="$t('Remove instance', instance)"
									:title="$t('Remove instance', instance)"
									@click="removeInstance(instance)"
								>
									<IconCardRemoveOutline />
								</button>
							</li>
							<li>
								<ColorModeSwitcher
									:instance="instance"
									@change="colorMode => {
										instance.colorMode = colorMode;
										instance.tify?.updateOptions({ colorMode })
									}"
								/>
							</li>
						</ul>

						<LanguageSwitcher :instance="instance" @change="code => instance.setLanguage(code)" />
					</div>

					<ManifestForm
						v-if="!instance.tify"
						v-model="instance.manifestUrl"
						class="sidebar-form"
						:instance="instance"
						@load="instance.loadManifest()"
					/>

					<SampleManifests :instance="instance" @load="url => instance.loadManifest(url)" />

					<footer class="footer">
						<a :href="env.repositoryUrl">
							<IconGithub />
							TIFY
						</a>
					</footer>
				</nav>

				<div :id="`container${instance.id}`" class="container" />
			</main>
		</section>
	</div>
</template>

<style lang="scss">
@import '../styles/util/settings';
@import '../styles/functions/*';
@import '../styles/mixins/*';
@import '../styles/extends/*';

:root {
	font-size: 24px;
}

*,
*::before,
*::after {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	font: inherit;
	outline-offset: 2px;

}

:focus-visible {
	outline: 1px solid $base-color;
}

.app {
	font: 14px/1rem sans-serif;
	margin: 0;
	min-height: 100vh;
	background: #777;
	display: flex;
	gap: 1px;
	flex-wrap: wrap;
}

.button {
	@extend %button;
	background: $base-color;
	color: light-dark(#fff, #171717);

	&:not(:disabled) {
		@include hover {
			background: oklch(from $base-color calc(l + .03) c h);
		}
	}
}

.container {
	background: $border-color;
	flex: 1;
}

.footer {
	text-align: center;
	width: 100%;

	a {
		color: $link-color;
		text-decoration: none;
	}
}

.header {
	align-items: center;
	background: $header-bg;
	border-bottom: 1px solid $border-color;
	display: flex;
	position: relative;
	padding: .25rem;
	z-index: 10;

	// TODO: Remove
	button:hover .wiggle {
		@keyframes wiggle {
			0% {transform:rotate(6deg);}
			50% {transform:rotate(-6deg);}
			100% {transform:rotate(6deg);}
		}

		animation: wiggle .4s infinite;
		transform-origin: 50% 80%;
	}
}

.input {
	background: none;
	border: 1px solid transparent;
	border-radius: $br;
	color: $base-color;
	font-size: 16px;
	flex: 1;
	min-width: 0;
	padding: calc(.125rem - 1px) calc(.25rem - 1px);
}

.input:focus {
	background:
		linear-gradient($header-bg, $header-bg),
		linear-gradient($header-bg 80%, $base-color 80%);
	background-origin: border-box;
	background-clip: padding-box, border-box;
	outline: none;
}

.instance {
	background: light-dark(#bbb, #333);
	background: $header-bg;
	container-type: size;
	color: $text-color;
	flex: 1;
	min-width: 320px;
	overflow: hidden;
	position: relative;
}

.logo {
	height: 1rem;
	margin: 0 0 .5rem;

	@container (width > 12rem) {
		height: 3rem;
		margin: 1.5rem 0 2rem;
	}
}

.main {
	display: flex;
	height: 100%;

	.header + & {
		height: calc(100% - 2rem - 1px);
	}
}

.sidebar {
	align-items: center;
	border-right: 1px solid $border-color;
	container-type: size;
	display: flex;
	flex-flow: column;
	flex: 100% 0 0;
	overflow: auto;
	padding-bottom: 1rem;
	transition: margin .2s, opacity .2s, visibility .2s;

	.instance:has(.tify) & {
		background: $header-bg;
		inset: calc(2rem + 1px) 0 0;
		position: absolute;
		z-index: 10;
		width: 100%;

		@container (width > 719px) {
			align-items: flex-start;
			flex: 0 0 12rem;
			justify-content: flex-start;
			position: absolute;
			position: static;
		}
	}

	&[hidden] {
		margin-left: -100%;
		opacity: 0;
		visibility: hidden;

		@container (width > 719px) {
			margin-left: -12rem;
		}
	}
}

.sidebar-controls {
	background: color-mix(in oklch, $header-bg, transparent 25%);
	backdrop-filter: $blur;
	border-bottom: 1px solid $border-color;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 auto;
	max-width: 100%;
	padding: .5rem;
	position: sticky;
	top: 0;
	width: 100%;
	z-index: 1;

	> * {
		width: 10rem;
	}

	@container (width > 12rem) {
		border: 0;
		position: static
	}
}

.sidebar-form {
	border-radius: $br;
	box-shadow: 0 0 0 1px $border-color;
	padding: .25rem;
	margin: 1.5rem 0;
	max-width: calc(100% - 1rem);
	width: 41.5rem;
}
</style>
