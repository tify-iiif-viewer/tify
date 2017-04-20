<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ 'Info'|trans }}</h2>

		<h3>{{ 'Metadata'|trans }}</h3>
		<table class="tify-info_list">
			<tr class="tify-info_row" v-for="item, index in manifest.metadata">
				<th class="tify-info_label">{{ item.label|formatLabel|trans }}</th>
				<td class="tify-info_text" :ref="`item${index}`">
					<div class="tify-info_value" :class="{'-limit-height': !items[index].fullyShown}">
						<template v-if="Array.isArray(item.value)">
							<div v-for="value in item.value" v-html="formatValue(value)"></div>
						</template>
						<div v-else v-html="formatValue(item.value)"></div>
					</div>

					<button v-if="items[index].isTooBig" class="tify-info_toggle" @click="toggleItem(index)">
						<template v-if="!items[index].fullyShown">
							<i class="tify-icon">expand_more</i> {{ 'Show all'|trans }}
						</template>
						<template v-else>
							<i class="tify-icon">expand_less</i> {{ 'Collapse'|trans }}
						</template>
					</button>
				</td>
			</tr>
		</table>

		<template v-if="manifest.attribution">
			<h3>{{ 'Attribution'|trans }}</h3>
			<p>{{ manifest.attribution }}</p>
		</template>

		<template v-if="manifest.logo.id">
			<p>
				<img class="tify-info_logo" :src="manifest.logo.id" alt="">
			</p>
		</template>
	</section>
</template>

<script>
	export default {
		props: [
			'manifest',
		],
		data() {
			return {
				items: [],
			};
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
			toggleItem(index) {
				this.items[index].fullyShown = !this.items[index].fullyShown;
			},
		},
		created() {
			for (let i = 0; i < Object.keys(this.manifest.metadata).length; i += 1) this.items.push({});
		},
		mounted() {
			this.items = [];
			for (let i = 0; i < Object.keys(this.manifest.metadata).length; i += 1) {
				const element = this.$refs[`item${i}`][0];
				const item = {
					isTooBig: (element.offsetHeight > 120),
					fullyShown: false,
				};
				this.items.push(item);
			}
		},
	};
</script>
