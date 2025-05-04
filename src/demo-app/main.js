import { createApp, h } from 'vue';

import DemoApp from './DemoApp.vue';

import translation from './translation';

const demoApp = createApp({
	render: () => h(DemoApp),
});

demoApp.config.globalProperties.$translate =	(string, instance) => translation[instance.language]?.[string]
	|| string.replace(/{.+?}/g, '');

demoApp.mount('#demo-app');
