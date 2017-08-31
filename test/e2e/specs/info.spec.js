Feature('Info');

Scenario('Display metadata', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=http://localhost:8081/manifest/wellcome-b18035723.json');
	I.waitForElement('.tify-app_main');

	I.click('Info');
	I.see('Related Resources');
	I.see('http://localhost:8081/item/b18035723');
});
