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
			// TODO: Add class if container height is below 480px and use in scan.scss

			Object.keys(this.options.breakpoints).forEach((breakpoint) => {
				if (this.$el.clientWidth <= this.options.breakpoints[breakpoint]) {
					this.$el.classList.add(`-${breakpoint}`);
				} else {
					this.$el.classList.remove(`-${breakpoint}`);
				}
			});

			if (this.$el.clientHeight <= 499) {
				this.$el.classList.add('-short');
			} else {
				this.$el.classList.remove('-short');
			}
		},
	},
	mounted() {
		// Set current breakpoint as classes on container element for use in CSS
		this.updateBreakpoint();
		window.addEventListener('resize', this.updateBreakpoint);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.updateBreakpoint);
	},
};
