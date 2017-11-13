Feature('Main');

Scenario('Start the app', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
	I.waitForElement('.tify-app_main');

	I.seeElement('#tify > .tify-app');

	I.see('Wunder der Vererbung', 'h1');
});
