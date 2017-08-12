<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ 'Info'|trans }}</h2>

		<div v-if="manifest.label" class="tify-info_section -title">
			<h3 class="tify-info_heading">{{ 'Title'|trans }}</h3>
			<div v-for="label in $root.iiifFormat(manifest.label)">
				{{ label }}
			</div>
		</div>

		<div v-if="manifest.metadata" class="tify-info_section -metadata">
			<h3>{{ 'Metadata'|trans }}</h3>
			<table class="tify-info_list">
				<tr class="tify-info_row" v-for="item, index in manifest.metadata">
					<th class="tify-info_label">
						<div v-for="label in $root.iiifFormat(item.label)">
							{{ label|cleanLabel }}
						</div>
					</th>
					<td class="tify-info_text">
						<div
							class="tify-info_value"
							ref="items"
							:class="{ '-collapsed': infoItems && infoItems[index].collapsed }"
							:style="infoItems && infoItems[index].collapsed ? collapsedStyle : null"
						>
							<div v-for="value in $root.iiifFormat(item.value)" v-html="value"/>
						</div>

						<button
							v-if="!infoItems || infoItems[index].limitHeight"
							class="tify-info_toggle"
							ref="buttons"
							@click="toggleItem(index)"
						>
							<template v-if="!infoItems || infoItems[index].collapsed">
								<i class="tify-icon">expand_more</i>
								{{ 'Expand'|trans }}
							</template>
							<template v-else>
								<i class="tify-icon">expand_less</i>
								{{ 'Collapse'|trans }}
							</template>
						</button>
					</td>
				</tr>
			</table>
		</div>

		<div v-if="manifest.description" class="tify-info_section -description">
			<h3>{{ 'Description'|trans }}</h3>
			<div v-for="description in $root.iiifFormat(manifest.description)" v-html="description"/>
		</div>

		<div v-if="manifest.attribution" class="tify-info_section -attribution">
			<h3>{{ 'Attribution'|trans }}</h3>
			<div v-for="attribution in $root.iiifFormat(manifest.attribution)">
				{{ attribution }}
			</div>
		</div>

		<div v-if="manifest.license" class="tify-info_section -license">
			<h3>{{ 'License'|trans }}</h3>
			<div>
				<a :href="manifest.license">{{ manifest.license }}</a>
			</div>
		</div>

		<div v-if="manifest.related" class="tify-info_section -related">
			<h3>{{ 'Related'|trans }}</h3>
			<div>
				<a :href="related">{{ related }}</a>
			</div>
		</div>

		<div v-if="manifest.logo" class="tify-info_section -logo">
			<a
				v-if="logoId && manifest.logo.service && manifest.logo.service['@id']"
				:href="manifest.logo.service['@id']"
			>
				<img class="tify-info_logo" :src="logoId" alt="">
			</a>
			<img v-else class="tify-info_logo" :src="logoId" alt="">
		</div>
	</section>
</template>

<script>
	// TODO: Handle and display manifest.service, see http://iiif.io/api/presentation/2.1/#service

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
			logoId() {
				return (this.manifest.logo['@id'] ? this.manifest.logo['@id'] : this.manifest.logo);
			},
			manifest() {
				return this.$root.manifest;
			},
			related() {
				if (typeof this.manifest.related === 'string') return this.manifest.related;

				return this.manifest.related['@id'];
			},
		},
		filters: {
			cleanLabel(label) {
				const cleanedLabel = label.replace('_', ' ');
				return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
			},
		},
		methods: {
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
