module.exports = {
	methods: {
		// TODO: Only working if duration % 10 === 0
		scrollTo(element, to, duration = 120) {
			const el = element;

			if (duration === 0) {
				el.scrollTop = to;
				return;
			}

			const difference = to - element.scrollTop;
			const perTick = difference / duration / .1;

			setTimeout(() => {
				el.scrollTop += perTick;
				if (el.scrollTop === to) return;
				this.scrollTo(el, to, duration - 10);
			}, 10);
		},
	},
};
