<script>
import { reactive } from 'vue';

import Instance from './Instance.class';

import ColorModeSwitcher from './components/ColorModeSwitcher.vue';
import DemoFooter from './components/DemoFooter.vue';
import DemoHeader from './components/DemoHeader.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import SampleManifests from './components/SampleManifests.vue';
import TifyLogo from './components/TifyLogo.vue';

export default {
	components: {
		ColorModeSwitcher,
		DemoFooter,
		DemoHeader,
		LanguageSwitcher,
		SampleManifests,
		TifyLogo,
	},
	data() {
		return {
			instances: [],
		};
	},
	beforeMount() {
		this.init();
	},
	mounted() {
		window.addEventListener('popstate', this.init);
	},
	destroy() {
		window.removeEventListener('popstate', this.init);
	},
	methods: {
		init() {
			// Restore state from URL query
			const params = (new URL(window.location)).searchParams;

			const instanceIds = [];
			params.forEach((value, key) => {
				if (key === 'iiif-content') {
					instanceIds.push('');
				}

				if (key.startsWith('manifest')) {
					instanceIds.push(key.replace('manifest', ''));
				}
			});

			if (this.instances.length && instanceIds.length === this.instances.filter((i) => i.tify).length) {
				return;
			}

			this.instances.forEach((i) => i.tify?.destroy());
			this.instances = [];

			instanceIds.forEach((id) => {
				const instance = this.addInstance({
					id,
					language: params.get(`language${id}`),
					manifestUrl: params.get(`manifest${id}`) || params.get('iiif-content'),
					urlQueryKey: `tify${id}`,
				});

				this.$nextTick(() => {
					instance.initTify();
				});
			});

			if (!instanceIds.length) {
				this.addInstance({
					language: params.get('language'),
				});
			}
		},
		addInstance(options = {}) {
			// eslint-disable-next-line no-new
			const instance = reactive(new Instance({
				...options,
				id: options.id || this.getNewInstanceId(),
			}));

			this.instances.push(instance);

			return instance;
		},
		getNewInstanceId() {
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
			<DemoHeader
				:instance="instance"
				:isInstanceRemovable="!!instance.tify || instances.length > 1"
				@loadManifest="instance.initTify()"
				@removeInstance="removeInstance(instance)"
				@updateManifestUrl="(manifestUrl) => instance.manifestUrl = manifestUrl"
				@toggleSidebar="instance.sidebarOpen = !instance.sidebarOpen"
			/>

			<div class="main">
				<div
					:id="`sidebar${instance.id}`"
					class="sidebar"
					:hidden="!instance.sidebarOpen && instance.tify"
				>
					<div class="sidebar-header">
						<component
							:is="instance.tify ? 'div' : 'h1'"
							class="logo"
						>
							<!-- eslint-disable-next-line vuejs-accessibility/anchor-has-content -->
							<a href=".">
								<TifyLogo />
							</a>
						</component>

						<div
							class="sidebar-controls"
							:class="{ '-gap': !instance.tify }"
						>
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
							<ul>
								<li>
									<button
										type="button"
										:aria-label="$translate('Add instance', instance)"
										:title="$translate('Add instance', instance)"
										@click="addInstance()"
									>
										<IconCardPlusOutline />
									</button>
								</li>
							</ul>
						</div>
					</div>

					<SampleManifests
						:instance="instance"
						@load="url => instance.initTify(url)"
					/>

					<DemoFooter />
				</div>

				<div
					:id="`container${instance.id}`"
					class="container"
				/>
			</div>
		</section>
	</main>
</template>

<style lang="scss">
@import '../styles/util/settings';

:root {
	font-size: 24px;
}

*,
*::before,
*::after {
	box-sizing: border-box;
	font: inherit;
	margin: 0;
	outline-offset: 2px;
	padding: 0;
}
</style>

<style lang="scss" scoped>
@import 'imports';

button {
	@extend %button-borderless;
}

.app {
	background: #777;
	display: flex;
	flex-wrap: wrap;
	font:
		16px/1.5
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		Roboto,
		Helvetica,
		Arial,
		sans-serif;
	gap: 1px;
	margin: 0;
	min-height: 100dvh;
}

.container {
	background: $border-color;
	flex: 1;
}

.instance {
	background: $bg;
	color: $text-color;
	container-type: size;
	flex: 1;
	min-width: 320px;
	overflow: auto;
	position: relative;

	.instance:has(.tify) & {
		overflow: hidden;
	}
}

.logo {
	height: 1rem;

	@container (width > #{$demo-sidebar-width}) {
		height: 2rem;
		margin: 1.5rem 0;
	}
}

.main {
	display: flex;
	height: 100%;

	.instance:has(.tify) & {
		height: calc(100% - 2rem - 1px);
	}
}

.sidebar {
	align-items: center;
	border-right: 1px solid $border-color;
	container-type: size;
	display: flex;
	flex: 100% 0 0;
	flex-flow: column;

	.instance:has(.tify) & {
		background: $header-bg;
		inset: calc(2rem + 1px) 0 0;
		overflow: auto;
		position: absolute;
		width: 100%;
		z-index: 10;

		@container (width > 719px) {
			align-items: start;
			flex: 0 0 $demo-sidebar-width;
			justify-content: start;
			position: absolute;
			position: static;
		}
	}

	&[hidden] {
		margin-left: -100%;
		opacity: 0;
		visibility: hidden;

		@container (width > 719px) {
			margin-left: -$demo-sidebar-width;
		}
	}
}

.sidebar-controls {
	display: flex;
	gap: .5rem;
	list-style: none;
	margin: .5rem 0 0;

	// Space for manifest form
	&.-gap {
		margin-top: 3.5rem;
	}

	> * + * {
		display: flex;

		&::before {
			border-left: 1px solid $border-color;
			content: '';
			height: 100%;
			margin: 0 .25rem 0 -.25rem;
		}
	}

	> ul {
		display: flex;
		list-style: none;
	}
}

.sidebar-header {
	align-items: center;
	backdrop-filter: $blur;
	background: oklch(from $header-bg l c h / 80%);
	border-bottom: 1px solid $border-color;
	display: flex;
	flex-direction: column;
	margin: 0 auto;
	max-width: 100%;
	padding: .5rem;
	position: sticky;
	top: 0;
	width: 100%;
	z-index: 1;

	@container (width > #{$demo-sidebar-width}) {
		border: 0;
		position: static;
	}
}
</style>
