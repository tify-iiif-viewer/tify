import { createApp, h } from 'vue';

import DemoApp from './DemoApp.vue';

const app = createApp({
	render: () => h(DemoApp),
});

const translations = { en: { $language: 'English' } };
const translationModules = import.meta.glob('./translations/*.json', { eager: true });
Object.entries(translationModules).forEach(([path, module]) => {
	translations[path.split('/').at(-1).split('.')[0]] = module.default;
});

app.config.globalProperties.$translate = (string, instance) => translations[instance.language]?.[string]
	|| string.replace(/\s+\[.+?\]/g, '');

app.config.globalProperties.$translations = translations;

app.mount('#demo');
