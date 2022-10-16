<template>
	<section class="tify-collection" tabindex="0">
		<h2 class="tify-sr-only">{{ $root.translate('Collection') }}</h2>

		<p v-if="items.length > 5" class="tify-collection-controls">
			<input
				v-model="filter"
				:aria-label="$root.translate('Filter collection')"
				class="tify-collection-filter"
				:placeholder="$root.translate('Filter collection')"
				type="text"
				@keydown.esc.prevent="filter ? filter = '' : $event.target.blur()"
				@keydown.stop
			/>
			<button class="tify-collection-reset" :disabled="!filter" @click="filter = ''">
				{{ $root.translate('Reset') }}
			</button>
		</p>

		<ol v-if="filteredItems.length" class="tify-collection-list">
			<collection-node v-for="item in filteredItems" :key="item['@id']" :item="item"/>
		</ol>
		<p v-else class="tify-collection-no-results">
			{{ $root.translate('No results') }}
		</p>
	</section>
</template>

<script>
import CollectionNode from '@/components/CollectionNode';

export default {
	components: {
		CollectionNode,
	},
	data() {
		return {
			filter: '',
		};
	},
	computed: {
		filteredItems() {
			const tokens = this.filter.trim().toLowerCase().split(/\s+/);
			return this.items.filter((item) => {
				const label = item.label.toLowerCase();
				return tokens.every((token) => label.includes(token));
			});
		},
		items() {
			if (this.$root.collection.manifests && this.$root.collection.collections) {
				// Create dummy collection containing both
				return [
					{
						'@id': 'tify-collection-manifests',
						'@type': 'sc:Collection',
						label: this.$root.translate('Documents'),
						children: this.$root.collection.manifests,
					},
					{
						'@id': 'tify-collection-collections',
						'@type': 'sc:Collection',
						label: this.$root.translate('Collections'),
						children: this.$root.collection.collections,
					},
				];
			}

			return this.$root.collection.manifests || this.$root.collection.collections;
		},
	},
};
</script>
