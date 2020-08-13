Feature('Fulltext');

Scenario('Display fulltext', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json&tify={"pages":[15]}');
	I.waitForElement('.tify-app_main');

	I.click('Fulltext');
	I.see('Alles höhere Leben - ob Tier oder');
}).tag('@smoke');
