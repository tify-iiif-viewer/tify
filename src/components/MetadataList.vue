<template>
	<div class="tify-info_metadata">
		<div v-for="(item, index) in metadata" :key="index">
			<template>
				<h4>
					<div v-bind:key="index" v-for="(label, index) in getLabels(item.label)">
						{{ label|cleanLabel }}
					</div>
				</h4>
				<div class="tify-info_content">
					<div
						class="tify-info_value"
						:class="{ '-collapsed': infoItems && infoItems[index] && infoItems[index].isCollapsed }"
						:style="infoItems && infoItems[index] && infoItems[index].isCollapsed ? collapsedStyle : null"
					>
						<div v-bind:key="value" v-for="value in getLabels(item.value)" v-html="value"/>
					</div>

					<button
						v-if="!infoItems || (infoItems && infoItems[index] && infoItems[index].isInitiallyCollapsed)"
						class="tify-info_toggle"
						@click="infoItems[index].isCollapsed = !infoItems[index].isCollapsed"
					>
						<template v-if="!infoItems || (infoItems && infoItems[index] && infoItems[index].isCollapsed)">
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
	</div>
</template>

<script>
const itemMaxLines = 5;
const lineHeight = 24; // [px] value from settings.scss
const maxCharsPerLine = 42; // value empirically determined (and checked against zooming in)

export default {
	props: [
		'metadata',
	],
	data() {
		return {
			infoItems: null,
		};
	},
	watch: {
		metadata() {
			this.updateInfoItems();
		},
	},
	filters: {
		cleanLabel(label) {
			const cleanedLabel = label.replace('_', ' ');
			return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
		},
	},
	mounted() {
		this.updateInfoItems();
	},
	methods: {
		updateInfoItems() {
			const itemMaxHeight = itemMaxLines * lineHeight;
			this.collapsedStyle = `max-height: ${itemMaxHeight}px; overflow: hidden`;

			const infoItems = [];
			const { length } = Object.values(this.metadata);
			for (let i = 0; i < length; i += 1) {
				const item = this.metadata[i];
				const values = this.$root.convertValueToArray(item.value);

				const expectedLineNumber = values.reduce((linesSum, thisValue) => {
					// assuming we need 1 line minimum to display each value
					// and a fixed number of chars fits into each line
					let nLines = Math.ceil(this.stripHtml(thisValue).length / maxCharsPerLine);
					if (nLines < 1) {
						nLines = 1;
					}

					return linesSum + nLines;
				}, 0);
				const limitHeight = (expectedLineNumber > itemMaxLines);
				const infoItem = {
					isCollapsed: limitHeight,
					isInitiallyCollapsed: limitHeight,
				};
				infoItems.push(infoItem);
			}
			this.infoItems = infoItems;
		},
		stripHtml(html) {
			const doc = new DOMParser().parseFromString(html, 'text/html');
			return doc.body.textContent || '';
		},
		getLabels(value) {
			return this.$root.convertValueToArray(value);
		},
	},
};
</script>
