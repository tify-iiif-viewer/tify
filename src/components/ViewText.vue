<script>
import { filterHtml } from '../modules/filter';

export default {
	computed: {
		pages() {
			return this.$store.options.pages.filter((page) => page > 0);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.annotationId': function () {
			this.scrollToCurrentAnnotation();
		},
		// eslint-disable-next-line func-names
		'$store.annotationsAvailable': function () {
			if (this.$store.options.annotationId) {
				this.scrollToCurrentAnnotation();
			}
		},
	},
	mounted() {
		if (this.$store.options.annotationId && this.$store.annotationsAvailable) {
			this.scrollToCurrentAnnotation();
		}
	},
	methods: {
		filterHtml,
		scrollToCurrentAnnotation() {
			this.$nextTick(() => {
				const item = this.$refs.currentItem?.[0];
				if (!item) {
					return;
				}

				item.scrollIntoView({
					behavior: 'smooth',
					block: item.offsetHeight < this.$refs.panel.offsetHeight / 2 ? 'center' : 'start',
				});
			});
		},
	},
};
</script>

<template>
	<section
		ref="panel"
		class="tify-text"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Text') }}
		</h2>

		<div
			v-if="$store.annotationsAvailable !== false"
			class="tify-text-pages"
		>
			<div
				v-for="page in pages"
				:key="page"
				class="tify-text-page"
			>
				<h3 v-if="$store.pageCount > 1">
					<PageName :number="page" />
				</h3>
				<ul class="tify-text-list">
					<li
						v-for="(annotation, index) in $store.annotations[page]"
						:key="`${page}-${index}`"
						:ref="$store.options.annotationId === annotation.id ? 'currentItem' : ''"
						class="tify-text-item"
						:class="{ '-current': $store.options.annotationId === annotation.id }"
					>
						<div
							role="button"
							tabindex="0"
							class="tify-text-toggle"
							@click="$store.toggleAnnotationId(annotation.id)"
							@keydown.enter.space="$store.toggleAnnotationId(annotation.id)"
							v-html="filterHtml(annotation.html)"
						/>
					</li>
				</ul>
			</div>
		</div>

		<p
			v-else
			class="tify-text-none"
		>
			{{ $translate('Text not available for this page') }}
		</p>
	</section>
</template>
