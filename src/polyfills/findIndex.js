// Polyfill for findIndex which is not handled by Babel
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
if (!Array.prototype.findIndex) {
	// eslint-disable-next-line no-extend-native
	Object.defineProperty(Array.prototype, 'findIndex', {
		value(predicate) {
			if (this == null) {
				throw new TypeError('Array.prototype.findIndex called on null or undefined');
			}
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}
			const list = Object(this);
			// eslint-disable-next-line no-bitwise
			const length = list.length >>> 0;
			// eslint-disable-next-line prefer-rest-params
			const thisArg = arguments[1];
			let value;

			for (let i = 0; i < length; i += 1) {
				value = list[i];
				if (predicate.call(thisArg, value, i, list)) {
					return i;
				}
			}
			return -1;
		},
		enumerable: false,
		configurable: false,
		writable: false,
	});
}
