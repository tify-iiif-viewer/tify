function Api(instance) {
	return {
		expose(method, name) {
			// eslint-disable-next-line no-param-reassign
			instance[name || method.name.replace('bound ', '')] = method;
		},
	};
}

export default {
	install: (app, options) => {
		// eslint-disable-next-line no-param-reassign
		app.config.globalProperties.$api = new Api(options.instance);
	},
};
