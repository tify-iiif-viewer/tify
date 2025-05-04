import { createApp, h } from 'vue';

import DemoApp from './DemoApp.vue';

import translations from './translations.json';

const demoApp = createApp({
	render: () => h(DemoApp),
});

demoApp.config.globalProperties.$translate =	(string, instance) => translations[instance.language]?.[string]
	|| string.replace(/{.+?}/g, '');

demoApp.mount('#demo-app');
