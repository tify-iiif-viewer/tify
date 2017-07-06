<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ 'Info'|trans }}</h2>

		<template v-if="manifest.label">
			<h3>{{ 'Title'|trans }}</h3>
			<p>{{ manifest.label }}</p>
		</template>

		<template v-if="manifest.metadata">
			<h3>{{ 'Metadata'|trans }}</h3>
			<table class="tify-info_list">
				<tr class="tify-info_row" v-for="item, index in manifest.metadata">
					<th class="tify-info_label">{{ item.label|formatLabel|trans }}</th>
					<td class="tify-info_text">
						<div
							class="tify-info_value"
							ref="items"
							:class="{ '-collapsed': infoItems && infoItems[index].collapsed }"
							:style="infoItems &&infoItems[index].collapsed ? collapsedStyle : null"
						>
							<template v-if="Array.isArray(item.value)">
								<template v-if="typeof item.value[0] === 'object'">
									<div v-html="formatValue(selectTranslation(item.value))"></div>
								</template>
								<div v-else v-for="value in item.value" v-html="formatValue(value)"></div>
							</template>
							<div v-else v-html="formatValue(item.value)"></div>
						</div>

						<button
							v-if="!infoItems || infoItems[index].limitHeight"
							class="tify-info_toggle"
							ref="buttons"
							@click="toggleItem(index)"
						>
							<template v-if="!infoItems || infoItems[index].collapsed">
								<i class="tify-icon">expand_more</i> {{ 'Show all'|trans }}
							</template>
							<template v-else>
								<i class="tify-icon">expand_less</i> {{ 'Collapse'|trans }}
							</template>
						</button>
					</td>
				</tr>
			</table>
		</template>

		<template v-if="manifest.attribution">
			<h3>{{ 'Attribution'|trans }}</h3>
			<p>{{ manifest.attribution }}</p>
		</template>

		<template v-if="manifest.license">
			<h3>{{ 'License'|trans }}</h3>
			<p><a :href="manifest.license">{{ manifest.license }}</a></p>
		</template>

		<template v-if="manifest.related">
			<h3>{{ 'Related'|trans }}</h3>
			<p><a :href="manifest.related">{{ manifest.related }}</a></p>
		</template>

		<template v-if="manifest.logo">
			<p><img class="tify-info_logo" :src="manifest.logo['@id'] ? manifest.logo['@id'] : manifest.logo" alt=""></p>
		</template>

		<p class="tify-info_manifest"><a :href="$root.manifestUrl">{{ 'Manifest URL'|trans }}</a></p>
	</section>
</template>

<script>
	const itemMaxLines = 5;
	const itemHeightMinDelta = 24;

	export default {
		data() {
			return {
				collapsedStyle: '',
				infoItems: null,
			};
		},
		computed: {
			manifest() {
				return this.$root.manifest;
			},
		},
		filters: {
			formatLabel(label) {
				const cleanedLabel = label.replace('_', ' ');
				return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
			},
		},
		methods: {
			formatValue(value) {
				const filteredValue = this.$root.$options.filters.filterHtml(value);
				return this.$root.$options.filters.trans(filteredValue);
			},
			selectTranslation(values) {
				const language = this.$root.options.language;
				let string;
				values.some((value) => {
					if (value['@language'] === language) {
						string = value['@value'];
						return true;
					}
					return false;
				});
				return string || values[0]['@value'] || '(Invalid value)';
			},
			toggleItem(index) {
				this.infoItems[index].collapsed = !this.infoItems[index].collapsed;
			},
		},
		mounted() {
			if (!this.manifest.metadata) return;

			const button = this.$refs.buttons[0];
			const buttonStyle = window.getComputedStyle(button);
			const buttonHeight = button.offsetHeight + parseInt(buttonStyle.marginTop, 10);

			const itemLineHeight = parseInt(window.getComputedStyle(this.$refs.items[0]).lineHeight, 10);
			const itemMaxHeight = itemLineHeight * itemMaxLines;

			this.collapsedStyle = `max-height: ${itemMaxHeight}px; overflow: hidden`;

			const infoItems = [];
			for (let i = 0; i < Object.keys(this.manifest.metadata).length; i += 1) {
				const element = this.$refs.items[i];
				const collapsedHeight = itemMaxHeight + buttonHeight;
				const limitHeight = (element.offsetHeight > collapsedHeight + itemHeightMinDelta);
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
