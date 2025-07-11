<script>
import { useId } from 'vue';

export default {
	name: 'CollectionNode',
	props: {
		item: {
			type: Object,
			default: () => {},
		},
	},
	data() {
		return {
			children: null,
			expanded: false,
		};
	},
	computed: {
		id() {
			return this.$getId(useId());
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

			this.$store.fetchJson(this.item['@id'] || this.item.id).then(
				(childManifest) => {
					this.children = childManifest.collections || childManifest.items || childManifest.manifests || [];
					this.expanded = true;
				},
				(error) => {
					const status = error.response
						? error.response.statusText || error.response.data || error.message
						: error.message;
					this.$store.addError(`Error loading IIIF manifest: ${status}`);
					this.children = false;
				},
			);
		},
	},
};
</script>

<template>
	<li
		class="tify-collection-item"
		:class="{ '-current': $store.manifest && $store.manifest.id === (item['@id'] || item.id) }"
	>
		<button
			v-if="item.type === 'Collection'"
			type="button"
			:aria-controls="id"
			:aria-expanded="expanded"
			class="tify-collection-link -has-children"
			@click="toggleChildren()"
		>
			<template v-if="expanded">
				<IconMinus />
				<span class="tify-sr-only">{{ $translate('Collapse') }}</span>
			</template>
			<template v-else>
				<IconPlus />
				<span class="tify-sr-only">{{ $translate('Expand') }}</span>
			</template>

			{{ $store.localize(item.label) }}
		</button>
		<a
			v-else
			href="javascript:;"
			class="tify-collection-link"
			@click="$store.loadManifest(item['@id'] || item.id, { expectedType: item.type, reset: true })"
		>
			{{ $store.localize(item.label) }}
		</a>

		<ol
			v-if="children !== false"
			v-show="expanded"
			:id="id"
			class="tify-collection-list"
		>
			<CollectionNode
				v-for="child in children"
				:key="child.id"
				:item="child"
			/>
		</ol>
		<p
			v-else
			v-show="expanded"
			:id="id"
			class="tify-collection-error"
		>
			{{ $translate('Could not load child manifest') }}
		</p>
	</li>
</template>
