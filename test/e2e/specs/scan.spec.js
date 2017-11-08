Scenario('Control scan via keyboard', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');

	I.pressKey('y');
	I.see('Rotate', '.tify-scan_button.-active');

	I.pressKey('z');
	I.pressKey('z');
	I.pressKey('z');
	I.see('Rotate', '.tify-scan_button:not(.-active)');

	I.pressKey('c');
	I.see('Brightness');
	I.pressKey('c');
	I.dontSee('Brightness');

	I.pressKey('c');
	I.see('Brightness');
	I.pressKey('Esc');
	I.dontSee('Brightness');
});
