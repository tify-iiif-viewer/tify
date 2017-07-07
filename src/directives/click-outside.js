import Vue from 'vue';

// Detect click outside of an element
// TODO: Click is not detected if OpenSeadragon canvas is clicked on Chrome Mobile
Vue.directive('click-outside', {
	bind(el, binding, vnode) {
		// eslint-disable-next-line no-param-reassign
		el.event = (event) => {
			if (!(el === event.target || el.contains(event.target))) {
				vnode.context[binding.expression](event);
			}
		};
		document.body.addEventListener('click', el.event);
	},
	unbind(el) {
		document.body.removeEventListener('click', el.event);
	},
});
