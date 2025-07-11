<script>
import { filterHtml } from '../modules/filter';
import { isValidUrl } from '../modules/validation';

export default {
	props: {
		metadata: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			infoItems: [],
		};
	},
	watch: {
		metadata() {
			this.updateInfoItems();
		},
	},
	mounted() {
		this.updateInfoItems();
	},
	methods: {
		updateInfoItems() {
			this.$nextTick(() => {
				if (!this.$refs.contents) {
					return;
				}

				this.$refs.contents.forEach((content, index) => {
					const fullHeight = content.offsetHeight;

					this.infoItems[index] = {
						collapsed: true,
						exceedsHeight: true,
					};

					this.$nextTick(() => {
						const collapsedHeight = content.offsetHeight;
						const shouldBeCollapsed = fullHeight >= collapsedHeight;

						this.infoItems[index] = {
							collapsed: shouldBeCollapsed,
							exceedsHeight: shouldBeCollapsed,
						};
					});
				});
			});
		},
		filterHtml,
		isValidUrl,
	},
};
</script>

<template>
	<div class="tify-info-metadata">
		<div
			v-for="(item, index) in metadata"
			:key="index"
		>
			<h4 v-if="item.label">
				{{ $store.localize(item.label) }}
			</h4>
			<div
				ref="contents"
				class="tify-info-content"
				:class="{ '-collapsed': infoItems[index] && infoItems[index].collapsed }"
			>
				<div class="tify-info-value">
					<p
						v-if="isValidUrl(item.value)"
						:key="`url-${index}`"
					>
						<a :href="item.value">{{ item.value }}</a>
					</p>
					<!-- NOTE: Using <div> because value may contain <p> -->
					<div
						v-else
						:key="`html-${index}`"
						v-html="filterHtml($store.localize(item.value))"
					/>
				</div>

				<button
					v-if="infoItems[index] && infoItems[index].exceedsHeight"
					type="button"
					class="tify-info-toggle"
					@click="infoItems[index].collapsed = !infoItems[index].collapsed"
				>
					<template v-if="infoItems[index].collapsed">
						<IconChevronDown />
						{{ $translate('Expand') }}
					</template>
					<template v-else>
						<IconChevronUp />
						{{ $translate('Collapse') }}
					</template>
				</button>
			</div>
		</div>
	</div>
</template>
