module.exports = {
	methods: {
		scrollTo(element, to, animationDuration = 120) {
			const el = element;
			const duration = (animationDuration === true ? 120 : animationDuration);

			if (!duration || duration < 0) {
				el.scrollTop = to;
				return;
			}

			const difference = to - element.scrollTop;
			const perTick = difference / duration / .1;

			setTimeout(() => {
				el.scrollTop += perTick;
				if (el.scrollTop === to) {
					return;
				}

				this.scrollTo(el, to, duration - 10);
			}, 10);
		},
		updateScrollPos(selector, animated = true) {
			const elements = this.$el.querySelectorAll(selector);
			if (!elements.length) {
				return;
			}

			let topCurrentElement = elements[0];
			const bottomCurrentElement = elements[elements.length - 1];
			Array.prototype.forEach.call(
				elements,
				(element) => {
					if (element.dataset.level > topCurrentElement.dataset.level) {
						topCurrentElement = element;
					}
				},
			);

			const listRect = this.$el.getBoundingClientRect();
			const topCurrentElementRect = topCurrentElement.getBoundingClientRect();
			const bottomCurrentElementRect = bottomCurrentElement.getBoundingClientRect();

			if (topCurrentElementRect.top < listRect.top) {
				const targetPos = (topCurrentElementRect.top - listRect.top) + this.$el.scrollTop;
				this.scrollTo(this.$el, targetPos - 50, animated);
			} else if (bottomCurrentElementRect.bottom > listRect.bottom) {
				const targetPos = (bottomCurrentElementRect.bottom - listRect.bottom) + this.$el.scrollTop;
				this.scrollTo(this.$el, targetPos + 50, animated);
			}
		},
	},
};
