<script>
export default {
	data() {
		return {
			query: this.$store.options.searchQuery || '',
		};
	},
	computed: {
		groupedHits() {
			const groups = [];
			this.$store.search.hits.forEach((hit) => {
				let group = groups.find((candidate) => candidate.page === hit.page);
				if (!group) {
					group = { page: hit.page, hits: [] };
					groups.push(group);
				}

				group.hits.push(hit);
			});

			return groups.sort((a, b) => a.page - b.page);
		},
		resultCount() {
			const { hits, total } = this.$store.search;
			const count = total ?? hits.length;
			if (count === 1) {
				return this.$translate('1 result');
			}

			const string = this.$translate('%d results');
			return string.replace('%d', count);
		},
	},
	watch: {
		// eslint-disable-next-line func-names
		'$store.options.searchQuery': function (searchQuery) {
			this.query = searchQuery || '';
			this.runSearch();
		},
		// eslint-disable-next-line func-names
		'$store.search.currentHitId': function () {
			this.scrollToCurrentHit();
		},
	},
	mounted() {
		this.runSearch();
	},
	methods: {
		runSearch() {
			const searchQuery = (this.$store.options.searchQuery || '').trim() || null;
			if (searchQuery !== this.$store.search.query) {
				this.$store.runSearch(searchQuery);
			}
		},
		scrollToCurrentHit() {
			this.$nextTick(() => {
				const item = this.$refs.currentItem?.[0];
				if (!item) {
					return;
				}

				item.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
				});
			});
		},
		submit() {
			this.$store.updateOptions({ searchQuery: this.query.trim() || null });
		},
	},
};
</script>

<template>
	<section
		ref="panel"
		class="tify-search"
		tabindex="0"
	>
		<h2 class="tify-sr-only">
			{{ $translate('Search') }}
		</h2>

		<form
			class="tify-search-form"
			role="search"
			@submit.prevent="submit()"
		>
			<input
				v-model="query"
				type="text"
				class="tify-search-input"
				:aria-label="$translate('Search within this document')"
				:placeholder="$translate('Search within this document')"
				@keydown.esc.prevent="query ? (query = '') : $event.target.blur()"
				@keydown.stop
			/>
			<button
				type="submit"
				class="tify-search-button"
				:title="$translate('Search')"
				:aria-label="$translate('Search')"
			>
				<IconMagnify />
			</button>
		</form>

		<template v-if="$store.search.query && !$store.loading">
			<p
				v-if="$store.search.hits.length"
				class="tify-search-count"
				role="status"
			>
				{{ resultCount }}
			</p>
			<p
				v-else
				class="tify-search-none"
				role="status"
			>
				{{ $translate('No results') }}
			</p>
		</template>

		<div
			v-for="group in groupedHits"
			:key="group.page"
			class="tify-search-page"
		>
			<h3 v-if="$store.pageCount > 1">
				<PageName :number="group.page" />
			</h3>
			<ul class="tify-search-list">
				<li
					v-for="hit in group.hits"
					:key="hit.id"
					:ref="$store.search.currentHitId === hit.id ? 'currentItem' : ''"
					class="tify-search-item"
					:class="{ '-current': $store.search.currentHitId === hit.id }"
				>
					<button
						type="button"
						class="tify-search-hit"
						:aria-current="$store.search.currentHitId === hit.id ? 'true' : null"
						@click="$store.setCurrentSearchHit(hit)"
					>
						<template v-if="hit.before">
							…{{ hit.before }}
						</template>
						<mark>{{ hit.text || $store.search.query }}</mark>
						<template v-if="hit.after">
							{{ hit.after }}…
						</template>
					</button>
				</li>
			</ul>
		</div>

		<p v-if="$store.search.next">
			<button
				type="button"
				class="tify-search-more"
				@click="$store.loadMoreSearchResults()"
			>
				{{ $translate('Load more results') }}
			</button>
		</p>
	</section>
</template>
