Feature('main');

Scenario('Change page', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=https://gdzstaging.sub.uni-goettingen.de/iiif/presentation/HANS_DE_7_w042081/manifest&tify={"pages":[15]}');
	I.waitForElement('.tify-app_main');

	I.see('15 : 7r', '.tify-page-select_button');

	I.click('First page');
	I.see('1 : -', '.tify-page-select_button');

	I.click('Next page');
	I.click('Next page');
	I.see('3 : 1r', '.tify-page-select_button');

	I.click('Next section');
	I.click('Next section');
	I.see('7 : 3r', '.tify-page-select_button');

	I.click('Last page');
	I.see('69 : -', '.tify-page-select_button');

	I.click('Previous section');
	I.click('Previous section');
	I.click('Previous section');
	I.click('Previous section');
	I.see('16 : 7v');
});
