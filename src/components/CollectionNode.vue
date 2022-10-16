<template>
	<li
		class="tify-collection-item"
		:class="{ '-current': $root.manifest && $root.manifest['@id'] === item['@id'] }"
	>
		<button
			v-if="item['@type'] === 'sc:Collection'"
			:aria-controls="id"
			:aria-expanded="expanded ? 'true' : 'false'"
			class="tify-collection-link -has-children"
			@click="toggleChildren()"
		>
			<template v-if="expanded">
				<icon-minus/>
				<span class="tify-sr-only">{{ $root.translate('Collapse') }}</span>
			</template>
			<template v-else>
				<icon-plus/>
				<span class="tify-sr-only">{{ $root.translate('Expand') }}</span>
			</template>

			{{ label }}
		</button>
		<a
			v-else
			href="javascript:;"
			class="tify-collection-link"
			@click="$root.loadManifest(item['@id'], { expectedType: item['@type'], reset: true })"
		>
			{{ label }}
		</a>

		<template v-if="expanded">
			<ol v-if="expanded" class="tify-collection-list" :id="id">
				<collection-node v-for="child in children" :key="child['@id']" :item="child"/>
			</ol>
			<p v-else-if="children === false" class="tify-collection-error">
				{{ $root.translate('Could not load child manifest') }}
			</p>
		</template>
	</li>
</template>

<script>
export default {
	name: 'collection-node',
	props: ['item'],
	data() {
		return {
			children: null,
			expanded: false,
			id: this.$root.getId(`collection-node-${Math.floor(Math.random() * 1e12)}`),
		};
	},
	computed: {
		label() {
			return this.item
				? this.$root.convertValueToArray(this.item.label).join(`${String.fromCharCode(160)}· `) // 160 = &nbsp;
				: '';
		},
	},
	methods: {
		toggleChildren() {
			if (this.expanded) {
				this.expanded = false;
				return;
			}

			if (this.children) {
				this.expanded = true;
				return;
			}

			if (this.item.children) {
				this.children = this.item.children;
				this.expanded = true;
				return;
			}

			this.$http.get(this.item['@id']).then((response) => {
				const manifest = response.data;
				this.children = manifest.manifests || manifest.collections || [];
				this.expanded = true;
			}, (error) => {
				const status = error.response ? (error.response.statusText || error.response.data) : error.message;
				this.$root.error = `Error loading IIIF manifest: ${status}`;
				this.children = false;
			});
		},
	},
};
</script>
