module.exports = {
	methods: {
		preventKeyboardEvent(event) {
			if (event.altKey || event.ctrlKey || event.metaKey) return true;

			if (
				['INPUT', 'SELECT', 'TEXTAREA'].indexOf(event.target.nodeName) > -1
				&& event.target.type !== 'range'
			) return true;

			return false;
		},
	},
};
