Feature('Info');

Scenario('Display related metadata', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=http://localhost:8081/manifest/wellcome-b18035723.json');
	I.waitForElement('.tify-app_main');

	I.click('Info');
	I.see('Related Resources');
	I.see('http://localhost:8081/item/b18035723');

	I.amOnPage('http://localhost:8080/?manifestUrl=http://localhost:8081/manifest/ubl-0000000001.json');
	I.click('Info');
	I.see('Related Resources');
	I.see('https://digital.ub.uni-leipzig.de/object/viewid/0000000001');
	I.see('https://iiif.ub.uni-leipzig.de/0000000001/manifest.json');
});

Scenario('Collapse long metadata values', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');
	I.click('Info');
	I.see('Expand', 'button');
});
