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
		env: () => ENV,
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
	<main class="app">
		<section
			v-for="instance in instances"
			:key="instance.id"
			class="instance"
			:style="`color-scheme: ${instance.colorMode === 'auto' ? 'light dark' : instance.colorMode}`"
		>
			<header v-if="instance.tify" class="header">
				<button
					type="button"
					class="header-button"
					aria-label="Toggle sidebar"
					:aria-controls="`sidebar${instance.id}`"
					:aria-expanded="instance.sidebarOpen"
					@click="instance.sidebarOpen = !instance.sidebarOpen"
				>
					<IconDotsVertical
						style="transition: transform .2s"
						:style="instance.sidebarOpen && 'transform: rotate(45deg)'"
					/>
				</button>

				<ManifestForm
					v-if="instance.tify"
					v-model="instance.manifestUrl"
					:instance="instance"
					@load="instance.loadManifest()"
				/>
			</header>

			<div class="main">
				<div
					:id="`sidebar${instance.id}`"
					class="sidebar"
					:hidden="!instance.sidebarOpen && instance.tify"
				>
					<div class="sidebar-controls">
						<component :is="instance.tify ? 'div' : 'h1'" class="logo">
							<!-- eslint-disable-next-line vuejs-accessibility/anchor-has-content -->
							<a href=".">
								<TifyLogo />
							</a>
						</component>

						<div
							style="
								display: flex;
								gap: .5rem;
								list-style: none;
								margin: .5rem 0 0;
							"
						>
							<ul
								style="
									display: flex;
									list-style: none;
								"
							>
								<li>
									<button
										type="button"
										class="button"
										style="border-radius: 2px 0 0 2px; padding: .25rem"
										:aria-label="$translate('Add instance', instance)"
										:title="$translate('Add instance', instance)"
										@click="addInstance()"
									>
										<IconCardPlusOutline />
									</button>
								</li>
								<li>
									<button
										type="button"
										class="button"
										:disabled="!instance.tify && instances.length < 2"
										style="border-radius: 0 2px 2px 0; margin-left: -1px; padding: .25rem"
										:aria-label="$translate('Remove instance', instance)"
										:title="$translate('Remove instance', instance)"
										@click="removeInstance(instance)"
									>
										<IconCardRemoveOutline />
									</button>
								</li>
							</ul>
							<ColorModeSwitcher
								:instance="instance"
								@change="colorMode => {
									instance.colorMode = colorMode;
									instance.tify?.updateOptions({ colorMode })
								}"
							/>
							<LanguageSwitcher
								:instance="instance"
								@change="code => instance.setLanguage(code)"
							/>
						</div>
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
				</div>

				<div :id="`container${instance.id}`" class="container" />
			</div>
		</section>
	</main>
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
	min-height: 100dvh;
	background: #777;
	display: flex;
	gap: 1px;
	flex-wrap: wrap;
}

.button {
	@extend %button;
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
	gap: .25rem;
	position: relative;
	padding: .25rem;
	z-index: 10;
}

.header-button {
	@extend %button;
	background: none;
	box-shadow: 0 0 0 1px currentColor inset;
	color: $link-color;
	padding: .25rem;

	&:not(:disabled) {
		@include hover {
			background: $base-color-paler;
		}

		&:active {
			box-shadow: $inset-shadow, 0 0 0 1px currentColor inset;
		}
	}
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

	@container (width > 15rem) {
		height: 3rem;
		margin: 1.5rem 0;
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

	.instance:has(.tify) & {
		background: $header-bg;
		inset: calc(2rem + 1px) 0 0;
		position: absolute;
		z-index: 10;
		width: 100%;

		@container (width > 719px) {
			align-items: flex-start;
			flex: 0 0 15rem;
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
			margin-left: -15rem;
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

	@container (width > 15rem) {
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
