<script>
import { useId } from 'vue';

import { onClickOutside } from '@vueuse/core';

import { preventEvent } from '../modules/keyboard';

export default {
	props: {
		label: {
			default: null,
			type: String,
		},
		position: {
			default: 'bottom',
			type: String,
		},
		shortcut: {
			default: null,
			type: String,
		},
	},
	emits: ['open'],
	data() {
		return {
			open: false,
		};
	},
	computed: {
		id() {
			return this.$.appContext.config.globalProperties.$getId ? this.$getId(useId()) : useId();
		},
	},
	mounted() {
		(this.$store?.rootElement || document.documentElement).addEventListener(
			'keydown',
			this.onKeydown,
		);

		onClickOutside(this.$el, () => {
			this.open = false;
		});
	},
	beforeUnmount() {
		(this.$store?.rootElement || document.documentElement).removeEventListener(
			'keydown',
			this.onKeydown,
		);
	},
	methods: {
		onKeydown(event) {
			if (preventEvent(event)) {
				return;
			}

			if (event.key === 'Escape') {
				this.open = false;
				return;
			}

			if (event.key === this.shortcut) {
				this.open = !this.open;
				if (this.open) {
					this.$emit('open');
				}
				event.preventDefault();
			}
		},
	},
};
</script>

<template>
	<div class="tify-dropdown">
		<button
			type="button"
			class="tify-dropdown-button"
			:aria-controls="id"
			:aria-expanded="open"
			:aria-label="label"
			:title="label"
			@click="
				open = !open;
				open && $emit('open');
			"
		>
			<slot name="button" />
		</button>
		<!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events -->
		<div
			v-show="open"
			:id="id"
			:class="`tify-dropdown-content -${position}`"
			@click="$event.target.closest('a, button') && (open = false)"
		>
			<slot />
		</div>
	</div>
</template>
