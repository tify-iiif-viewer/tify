Feature('Main');

Scenario('Start the app', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json&language=de');
	I.waitForElement('.tify-app_main');

	I.seeElement('#tify > .tify-app');
});
