<template>
	<div class="tify-info-metadata">
		<div
			v-for="(item, index) in metadata"
			:key="index"
		>
			<h4>
				<div
					v-for="(label, index2) in $store.convertValueToArray(item.label)"
					:key="index2"
				>
					{{ cleanLabel(label) }}
				</div>
			</h4>
			<div
				ref="contents"
				class="tify-info-content"
				:class="{ '-collapsed': infoItems[index] && infoItems[index].collapsed }"
			>
				<div class="tify-info-value">
					<template v-for="value in $store.convertValueToArray(item.value)">
						<div
							v-if="isValidUrl(value)"
							:key="'url-' + value"
						>
							<a :href="value">{{ value }}</a>
						</div>
						<div
							v-else
							:key="'html-' + value"
							v-html="value"
						/>
					</template>
				</div>

				<button
					v-if="infoItems[index] && infoItems[index].exceedsHeight"
					type="button"
					class="tify-info-toggle"
					@click="infoItems[index].collapsed = !infoItems[index].collapsed"
				>
					<template v-if="infoItems[index].collapsed">
						<icon-chevron-down />
						{{ $translate('Expand') }}
					</template>
					<template v-else>
						<icon-chevron-up />
						{{ $translate('Collapse') }}
					</template>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
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
		cleanLabel(label) {
			const cleanedLabel = label.replace('_', ' ');
			return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
		},
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
		isValidUrl,
	},
};
</script>
