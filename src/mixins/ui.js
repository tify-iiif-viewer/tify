export default {
	methods: {
		isMobile() {
			// For unit tests
			if (process.env.NODE_ENV === 'test' && !this.$root.$el) {
				return true;
			}

			// TODO: Update this to work with custom breakpoints
			return (this.$root.$el.offsetWidth < this.$root.$data.options.breakpoints.medium);
		},
		updateBreakpoint() {
			Object.keys(this.options.breakpoints).forEach((breakpoint) => {
				if (this.$el.clientWidth <= this.options.breakpoints[breakpoint]) {
					this.$el.classList.add(`-${breakpoint}`);
				} else {
					this.$el.classList.remove(`-${breakpoint}`);
				}
			});
		},
		appendStylesheet(url) {
			const link = document.createElement('link');
			link.href = url;
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		},
	},
	mounted() {
		if (this.options.stylesheet) {
			this.appendStylesheet(this.options.stylesheet);
		}

		// Set current breakpoint as classes on container element for use in CSS
		window.addEventListener('resize', () => {
			this.updateBreakpoint();
		});
		this.updateBreakpoint();
	},
};
