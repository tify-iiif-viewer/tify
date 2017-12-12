<template>
	<div>
		<template v-for="item, index in metadata">
			<h4>
				<div v-for="label in $root.iiifConvertToArray(item.label)">
					{{ label|cleanLabel }}
				</div>
			</h4>
			<div class="tify-info_content">
				<div
					class="tify-info_value"
					ref="items"
					:class="{ '-collapsed': infoItems && infoItems[index].collapsed }"
					:style="infoItems && infoItems[index].collapsed ? collapsedStyle : null"
				>
					<div v-for="value in $root.iiifConvertToArray(item.value)" v-html="value"/>
				</div>

				<button
					v-if="!infoItems || infoItems[index].limitHeight"
					class="tify-info_toggle"
					ref="buttons"
					@click="infoItems[index].collapsed = !infoItems[index].collapsed"
				>
					<template v-if="!infoItems || infoItems[index].collapsed">
						<icon name="expand_more"/>
						{{ 'Expand'|trans }}
					</template>
					<template v-else>
						<icon name="expand_less"/>
						{{ 'Collapse'|trans }}
					</template>
				</button>
			</div>
		</template>
	</div>
</template>

<script>
	const itemMaxLines = 5;
	const itemHeightMinDelta = 24;

	export default {
		props: [
			'metadata',
		],
		data() {
			return {
				infoItems: null,
			};
		},
		filters: {
			cleanLabel(label) {
				const cleanedLabel = label.replace('_', ' ');
				return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
			},
		},
		mounted() {
			if (!this.$refs.buttons) return;

			const button = this.$refs.buttons[0];
			const buttonStyle = window.getComputedStyle(button);
			const buttonHeight = button.offsetHeight + parseInt(buttonStyle.marginTop, 10);

			const itemLineHeight = parseInt(window.getComputedStyle(this.$refs.items[0]).lineHeight, 10);
			const itemMaxHeight = itemLineHeight * itemMaxLines;

			this.collapsedStyle = `max-height: ${itemMaxHeight}px; overflow: hidden`;

			const infoItems = [];
			const collapsedHeight = itemMaxHeight + buttonHeight + itemHeightMinDelta;
			const { length } = Object.keys(this.metadata);
			for (let i = 0; i < length; i += 1) {
				const element = this.$refs.items[i];
				const limitHeight = (element.offsetHeight > collapsedHeight);
				const infoItem = {
					collapsed: limitHeight,
					limitHeight,
				};
				infoItems.push(infoItem);
			}
			this.infoItems = infoItems;
		},
	};
</script>
