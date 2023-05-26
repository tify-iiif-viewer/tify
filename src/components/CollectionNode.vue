<template>
	<li
		class="tify-collection-item"
		:class="{ '-current': manifest['@id'] === item['@id'] }"
	>
		<button
			v-if="item['@type'] === 'sc:Collection'"
			type="button"
			:aria-controls="id"
			:aria-expanded="expanded ? 'true' : 'false'"
			class="tify-collection-link -has-children"
			@click="toggleChildren()"
		>
			<template v-if="expanded">
				<icon-minus />
				<span class="tify-sr-only">{{ translate('Collapse') }}</span>
			</template>
			<template v-else>
				<icon-plus />
				<span class="tify-sr-only">{{ translate('Expand') }}</span>
			</template>

			{{ label }}
		</button>
		<a
			v-else
			href="javascript:;"
			class="tify-collection-link"
			@click="loadManifest(item['@id'], { expectedType: item['@type'], reset: true }, this)"
		>
			{{ label }}
		</a>

		<template v-if="expanded">
			<ol
				v-if="expanded"
				:id="id"
				class="tify-collection-list"
			>
				<collection-node
					v-for="child in children"
					:key="child['@id']"
					:item="child"
				/>
			</ol>
			<p
				v-else-if="children === false"
				class="tify-collection-error"
			>
				{{ translate('Could not load child manifest') }}
			</p>
		</template>
	</li>
</template>

<script>
import { errorHandler } from '../modules/errorHandler';
import { getId } from '../modules/id';
import { fetchJson } from '../modules/http';
import { translate } from '../modules/i18n';
import { convertValueToArray, loadManifest } from '../modules/iiif';
import { manifest } from '../modules/store';

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
			id: getId(`collection-node-${Math.floor(Math.random() * 1e12)}`),
			manifest,
		};
	},
	computed: {
		label() {
			return this.item.label
				? convertValueToArray(this.item.label).join(`${String.fromCharCode(160)}· `) // 160 = &nbsp;
				: '';
		},
	},
	methods: {
		loadManifest,
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

			fetchJson(this.item['@id']).then(
				(childManifest) => {
					this.children = childManifest.manifests || childManifest.collections || [];
					this.expanded = true;
				},
				(error) => {
					const status = error.response
						? error.response.statusText || error.response.data || error.message
						: error.message;
					errorHandler.add(`Error loading IIIF manifest: ${status}`);
					this.children = false;
				},
			);
		},
		translate,
	},
};
</script>
