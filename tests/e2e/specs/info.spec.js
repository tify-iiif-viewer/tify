Feature('Info');

Scenario('Display related metadata', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
	I.waitForElement('.tify-app_main');

	I.see('Related Resources');
	I.see('http://localhost:8081/item/b18035723');

	I.amOnPage('/?manifest=http://localhost:8081/manifest/ubl-0000000001.json');
	I.see('Related Resources');
	I.see('https://digital.ub.uni-leipzig.de/object/viewid/0000000001');
	I.see('https://iiif.ub.uni-leipzig.de/0000000001/manifest.json');
}).tag('@smoke');

Scenario('Collapse long metadata values', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.see('Expand', 'button');
}).tag('@smoke');

Scenario('Show metadata of the current structure', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json');
	I.waitForElement('.tify-app_main');

	I.see('Current Element');
	I.see('Titelseite');
	I.see('Weigel, Erhard', '.tify-info_section.-metadata.-structure');

	I.click('Last page');
	I.dontSee('Current Element');
}).tag('@smoke');

Scenario('Show metadata of a nested structure', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-DE_611_BF_5619_1801_1806.json');
	I.waitForElement('.tify-app_main');
	I.click('Next page');
	I.click('Next page');
	I.click('Next page');
	I.click('Next page');

	I.see('Current Element');
	I.see('[Brief des Barons von Asch an Heyne vom 29.01./10.02.1801]', '.tify-info_section.-metadata.-structure');
}).tag('@smoke');
