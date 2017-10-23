<template>
	<section class="tify-info">
		<h2 class="tify-sr-only">{{ 'Info'|trans }}</h2>

		<div v-if="manifest.label" class="tify-info_section -title">
			<h3 class="tify-info_heading">{{ 'Title'|trans }}</h3>
			<div v-for="label in $root.iiifConvertToArray(manifest.label)">
				{{ label }}
			</div>
		</div>

		<div v-if="manifest.metadata" class="tify-info_section -metadata">
			<h3>{{ 'Metadata'|trans }}</h3>
			<table class="tify-info_list">
				<tr class="tify-info_row" v-for="item, index in manifest.metadata">
					<th class="tify-info_label">
						<div v-for="label in $root.iiifConvertToArray(item.label)">
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
							<div v-for="value in $root.iiifConvertToArray(item.value)" v-html="value"/>
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
			<div v-for="description in $root.iiifConvertToArray(manifest.description)" v-html="description"/>
		</div>


		<div v-if="license.length" class="tify-info_section -license">
			<h3>{{ 'License'|trans }}</h3>
			<div v-for="item in license">
				<a v-if="typeof item === 'string'" :href="item">
					{{ item }}
				</a>
				<a v-else :href="item['@id']">
					{{ item['label'] || item['@id'] }}
				</a>
			</div>
		</div>

		<div v-if="related.length" class="tify-info_section -related">
			<h3>{{ 'Related Resources'|trans }}</h3>
			<div v-for="item in related">
				<a v-if="typeof item === 'string'" :href="item">
					{{ item }}
				</a>
				<a v-else :href="item['@id']">
					{{ item['label'] || item['@id'] }}
				</a>
			</div>
		</div>

		<div v-if="manifest.attribution" class="tify-info_section -attribution">
			<h3>{{ 'Attribution'|trans }}</h3>
			<div v-for="item in $root.iiifConvertToArray(manifest.attribution)" v-html="item"/>
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
			license() {
				return this.manifest.license ? this.$root.iiifConvertToArray(this.manifest.license) : [];
			},
			logoId() {
				return (this.manifest.logo['@id'] ? this.manifest.logo['@id'] : this.manifest.logo);
			},
			manifest() {
				return this.$root.manifest;
			},
			related() {
				return this.manifest.related ? this.$root.iiifConvertToArray(this.manifest.related) : [];
			},
		},
		filters: {
			cleanLabel(label) {
				const cleanedLabel = label.replace('_', ' ');
				return cleanedLabel.charAt(0).toUpperCase() + cleanedLabel.substr(1);
			},
		},
		methods: {
			init() {
				this.isInited = true;

				if (!this.manifest.metadata) return;

				if (!this.$refs.buttons) return;

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
			toggleItem(index) {
				this.infoItems[index].collapsed = !this.infoItems[index].collapsed;
			},
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.view': function (view) {
				if (view === 'info') {
					if (!this.isInited) this.init();
				}
			},
		},
		mounted() {
			if (this.$root.params.view === 'info') this.init();
		},
	};
</script>
