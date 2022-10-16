import Vue from 'vue';

// Detect click outside of an element
Vue.directive('click-outside', {
	bind(element, binding, vnode) {
		// eslint-disable-next-line no-param-reassign
		element.event = (event) => {
			if (!(element === event.target || element.contains(event.target))) {
				vnode.context[binding.expression](event);
			}
		};

		document.body.addEventListener('click', element.event);
	},
	unbind(element) {
		document.body.removeEventListener('click', element.event);
	},
});
