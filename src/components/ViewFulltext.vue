<script>
import { filterHtml } from '../modules/filter';

export default {
	computed: {
		pages() {
			return this.$store.options.pages.filter((page) => !!page);
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
		class="tify-fulltext"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Fulltext') }}
		</h2>

		<div
			v-if="$store.annotationsAvailable !== false"
			class="tify-fulltext-texts"
		>
			<div
				v-for="page in pages"
				:key="page"
				class="tify-fulltext-page"
			>
				<h3>
					{{ $translate('Page') }}
					{{ $store.getPageLabel(page, $store.manifest.items[page - 1].label) }}
				</h3>
				<ul class="tify-fulltext-list">
					<li
						v-for="(annotation, index) in $store.annotations[page]"
						:key="`${page}-${index}`"
						:ref="$store.options.annotationId === annotation.id ? 'currentItem' : ''"
						class="tify-fulltext-item"
						:class="{ '-current': $store.options.annotationId === annotation.id }"
					>
						<div
							role="button"
							tabindex="0"
							class="tify-fulltext-toggle"
							@keydown.enter.space="$store.toggleAnnotationId(annotation.id)"
							@click="$store.toggleAnnotationId(annotation.id)"
							v-html="filterHtml(annotation.html)"
						/>
					</li>
				</ul>
			</div>
		</div>

		<p
			v-else
			class="tify-fulltext-none"
		>
			{{ $translate('Fulltext not available for this page') }}
		</p>
	</section>
</template>
