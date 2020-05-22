Feature('Export');

Scenario('Display export links', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-PPN857449303.json');
	I.waitForElement('.tify-app_main');

	I.click('Export');
	I.see('Download Individual Images');
	I.see('Page 1 : -');

	I.click('Next page');
	I.see('Page 2 : -');

	I.click('PDFs for each element');
	I.see('Titelseite');

	I.seeElement('a[href="https://gdzdev.sub.uni-goettingen.de/download/pdf/PPN857449303/LOG_0001.pdf"]');
}).tag('@smoke');
