Feature('Export');

Scenario('Display export links', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json');

	I.waitForElement('.tify-app_main');

	I.click('View');
	I.click('Export');
	I.see('Download Individual Images');
	I.see('Page 1 : -');

	I.click('Next page');
	I.see('Page 2 : -');

	I.click('Download PDFs per chapter');
	I.see('Titelseite');

	// TODO: "//" is actually missing in the original manifest
	I.seeElement('a[href="https:gdz.sub.uni-goettingen.de/download/pdf/PPN857449303/LOG_0001.pdf"]');
});
