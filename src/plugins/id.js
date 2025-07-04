export default {
	install: (app) => {
		// Crypto is only available in newer browsers and with HTTPS
		const appId = crypto?.randomUUID
			? crypto.randomUUID()
			: Math.random().toString().slice(2);

		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$getId = (label) => `${appId}-${label}`;
	},
};
