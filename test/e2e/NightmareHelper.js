// eslint-disable-next-line camelcase, no-undef
class NightmareHelper extends codecept_helper {
	_before() {
		this.consoleOutput = null;
		this.helpers.Nightmare.browser.on('console', (type, message) => {
			this.consoleOutput = { type, message: JSON.stringify(message) };
		});
	}

	_afterStep() {
		if (this.consoleOutput && this.consoleOutput.type !== 'log') {
			throw new Error(`Console ${this.consoleOutput.type}: ${this.consoleOutput.message}`);
		}
	}
}

module.exports = NightmareHelper;
