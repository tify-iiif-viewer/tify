Feature('Main');

Scenario('Start the app', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json&language=de');
	I.waitForElement('.tify-app_main');

	I.seeElement('#tify > .tify-app');
}).tag('@smoke');

// TODO: Test disabled because it fails, despite working fine in the browser
// Scenario('Toggle fullscreen via keyboard', (I) => {
// 	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
//
// 	I.waitForElement('.tify-app_main');
// 	I.see('Fullscreen', 'button');
// 	I.dontSee('Exit fullscreen', 'button');
//
// 	I.pressKey('f');
// 	I.waitForElement('.tify-header_button[title="Exit fullscreen"]');
// 	I.see('Exit fullscreen', '.tify-header_button');
// 	I.pressKey('f');
// 	I.see('Fullscreen', 'button');
//
// 	// TODO: Escape does not get triggered, may work after CodeceptJS updating to Webdriver@5
// 	I.pressKey('f');
// 	I.see('Exit fullscreen', 'button');
// 	I.pressKey('Escape');
// 	I.see('Fullscreen', 'button');
// });

// TODO: Test disabled because it fails, despite working fine in the browser
// Scenario('Toggle fullscreen via mouse', (I) => {
// 	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
// 	I.resizeWindow(1600, 900);
// 	I.waitForElement('.tify-app_main');
// 	I.see('Fullscreen', 'button');
// 	I.dontSee('Exit fullscreen', 'button');
//
// 	I.click('Fullscreen');
// 	I.see('Exit fullscreen', 'button');
// 	I.click('Exit fullscreen');
// 	I.see('Fullscreen', 'button');
//
// 	I.click('Fullscreen');
// 	I.see('Exit fullscreen', 'button');
// 	I.pressKey('Esc');
// 	I.see('Fullscreen', 'button');
// });
