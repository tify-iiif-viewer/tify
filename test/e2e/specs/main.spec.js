Feature('Main');

Scenario('Start the app', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json&language=de');
	I.waitForElement('.tify-app_main');

	I.seeElement('#tify > .tify-app');
});

Scenario('Toggle fullscreen via keyboard', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.resizeWindow(1600, 800);
	I.waitForElement('.tify-app_main');
	I.see('Fullscreen', 'button');
	I.dontSee('Exit fullscreen', 'button');

	I.pressKey('u');
	I.see('Exit fullscreen', 'button');
	I.pressKey('u');
	I.see('Fullscreen', 'button');

	I.pressKey('u');
	I.see('Exit fullscreen', 'button');
	I.pressKey('Esc');
	I.see('Fullscreen', 'button');
});

Scenario('Toggle fullscreen via mouse', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.resizeWindow(1600, 800);
	I.waitForElement('.tify-app_main');
	I.see('Fullscreen', 'button');
	I.dontSee('Exit fullscreen', 'button');

	I.click('Fullscreen');
	I.see('Exit fullscreen', 'button');
	I.click('Exit fullscreen');
	I.see('Fullscreen', 'button');

	I.click('Fullscreen');
	I.see('Exit fullscreen', 'button');
	I.pressKey('Esc');
	I.see('Fullscreen', 'button');
});
