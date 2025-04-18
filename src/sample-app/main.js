import { createApp, h } from 'vue';

import App from './App.vue';

import translation from './translation';

const app = createApp({
	render: () => h(App),
});

app.config.globalProperties.$t = (string, instance) => translation[instance.language]?.[string] || string;

app.mount('#app');
