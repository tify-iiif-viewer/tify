Feature('Fullscreen');

Scenario('Control fullscreen via keyboard', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');

	I.see('Fullscreen', '.fullscreen');
	I.pressKey('u');
	I.see('Exit fullscreen', '.exit_fullscreen');
	I.pressKey('U');
	I.see('Fullscreen', '.fullscreen');
});

Scenario('Control fullscreen via click', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');

	I.see('Fullscreen', '.fullscreen');
	I.click('.fullscreen');
	I.see('Exit fullscreen', '.exit_fullscreen');
	I.click('.exit_fullscreen');
	I.see('Fullscreen', '.fullscreen');
});
