/* global actor */

// In this file you can append custom step methods to 'I' object
module.exports = () => {
	return actor({
		// Define custom steps here, use 'this' to access default methods of I.

		// I.pressKey(['shift', 'x']) is not working
		reallyPressKey(caseSensitiveKey) {
			this.executeScript((key) => {
				window.dispatchEvent(new KeyboardEvent('keydown', { key }));
				window.dispatchEvent(new KeyboardEvent('keyup', { key }));
			}, caseSensitiveKey);
		},
	});
};
