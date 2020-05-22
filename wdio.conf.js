
exports.config = {
	capabilities: [{
		browserName: 'chrome',
		maxInstances: 1,
	},
	{
		browserName: 'firefox',
		maxInstances: 1,
	}],
	async afterSession() {
		// workaround to make sure the chromedriver shuts down
		await browser.pause(2000);
	},
	async after() {
		// workaround to make sure the chromedriver shuts down
		await browser.pause(2000);
		browser.deleteSession();
	},
};
