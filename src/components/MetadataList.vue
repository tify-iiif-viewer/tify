<template>
	<div class="tify-info_metadata">
		<div v-for="(item, index) in metadata" :key="index">
			<h4>
				<div v-bind:key="index" v-for="(label, index) in $root.convertValueToArray(item.label)">
					{{ cleanLabel(label) }}
				</div>
			</h4>
			<div
				class="tify-info_content"
				:class="{ '-collapsed': infoItems[index] && infoItems[index].collapsed }"
				ref="contents"
			>
				<div class="tify-info_value">
					<div v-bind:key="value" v-for="value in $root.convertValueToArray(item.value)" v-html="value"/>
				</div>

				<button
					v-if="infoItems[index] && infoItems[index].exceedsHeight"
					class="tify-info_toggle"
					@click="infoItems[index].collapsed = !infoItems[index].collapsed"
				>
					<template v-if="infoItems[index].collapsed">
						<icon-chevron-down/>
						{{ $root.translate('Expand') }}
					</template>
					<template v-else>
						<icon-chevron-up/>
						{{ $root.translate('Collapse') }}
					</template>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: [
		'metadata',
	],
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

					this.$set(this.infoItems, index, {
						collapsed: true,
						exceedsHeight: true,
					});

					this.$nextTick(() => {
						const collapsedHeight = content.offsetHeight;
						const shouldBeCollapsed = fullHeight >= collapsedHeight;

						this.$set(this.infoItems, index, {
							collapsed: shouldBeCollapsed,
							exceedsHeight: shouldBeCollapsed,
						});
					});
				});
			});
		},
	},
};
</script>
