Feature('Scan');

Scenario('Change page', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=https://gdzdev.sub.uni-goettingen.de/iiif/presentation/PPN478508743_0018/manifest&page=668');
	I.waitForElement('.tify-app_main');
	I.see('668 : 653', '.tify-page-select_button');

	I.click('First page');
	I.see('1 : -', '.tify-page-select_button');

	I.click('Next page');
	I.click('Next page');
	I.see('3 : -', '.tify-page-select_button');

	I.click('Next section');
	I.click('Next section');
	I.see('12 : 3', '.tify-page-select_button');

	I.click('Last page');
	I.see('687 : 672', '.tify-page-select_button');

	I.click('Previous section');
	I.click('Previous section');
	I.click('Previous section');
	I.click('Previous section');
	I.see('658 : 643');
});
