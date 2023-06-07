<template>
	<section
		class="tify-collection"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Collection') }}
		</h2>

		<p
			v-if="items.length > 5"
			class="tify-collection-controls"
		>
			<input
				v-model="filter"
				:aria-label="$translate('Filter collection')"
				class="tify-collection-filter"
				:placeholder="$translate('Filter collection')"
				type="text"
				@keydown.esc.prevent="filter ? (filter = '') : $event.target.blur()"
				@keydown.stop
			/>
			<button
				type="button"
				class="tify-collection-reset"
				:disabled="!filter"
				@click="filter = ''"
			>
				{{ $translate('Reset') }}
			</button>
		</p>

		<ol
			v-if="filteredItems.length"
			class="tify-collection-list"
		>
			<collection-node
				v-for="item in filteredItems"
				:key="item['@id']"
				:item="item"
			/>
		</ol>
		<p
			v-else
			class="tify-collection-no-results"
		>
			{{ $translate('No results') }}
		</p>
	</section>
</template>

<script>
export default {
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
			if (this.$store.collection.manifests && this.$store.collection.collections) {
				// Create dummy collection containing both
				return [
					{
						'@id': 'tify-collection-manifests',
						'@type': 'sc:Collection',
						label: this.$translate('Documents'),
						children: this.$store.collection.manifests,
					},
					{
						'@id': 'tify-collection-collections',
						'@type': 'sc:Collection',
						label: this.$translate('Collections'),
						children: this.$store.collection.collections,
					},
				];
			}

			return this.$store.collection.manifests || this.$store.collection.collections;
		},
	},
};
</script>
