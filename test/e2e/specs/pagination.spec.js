Feature('Pagination');

const currentPage = '.tify-page-select_button';

Scenario('Change page via buttons', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify={"pages":[15]}');
	I.waitForElement('.tify-app_main');

	I.see('15 : 7r', currentPage);

	I.click('First page');
	I.see('1 : -', currentPage);

	I.click('Next page');
	I.click('Next page');
	I.see('3 : 1r', currentPage);

	I.click('Next section');
	I.click('Next section');
	I.see('7 : 3r', currentPage);

	I.click('Last page');
	I.see('69 : -', currentPage);

	I.click('Previous section');
	I.click('Previous section');
	I.click('Previous section');
	I.click('Previous section');
	I.see('16 : 7v');

	I.click('Toggle double-page');
	I.see('Toggle double-page', '.-active');
});

Scenario('Change page via keyboard', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify={"pages":[15]}');
	I.waitForElement('.tify-app_main');

	I.see('15 : 7r', currentPage);

	I.pressKey('q');
	I.see('14 : 6v', currentPage);
	I.pressKey('e');
	I.see('15 : 7r', currentPage);

	I.pressKey('b');
	I.see('14 : 6v', currentPage);
	I.see('Toggle double-page', '.-active');

	I.pressKey('q');
	I.see('12 : 5v', currentPage);
	I.pressKey(',');
	I.see('10 : 4v', currentPage);

	I.pressKey('e');
	I.see('12 : 5v', currentPage);
	I.pressKey('.');
	I.see('14 : 6v', currentPage);

	I.reallyPressKey('Q');
	I.see('1 : -', currentPage);

	I.reallyPressKey('E');
	I.see('68 : -', currentPage);

	I.pressKey('b');
	I.see('68 : -', currentPage);
	I.dontSee('Toggle double-page', '.-active');

	I.reallyPressKey('Q');
	I.see('1 : -', currentPage);

	I.reallyPressKey('E');
	I.see('69 : -', currentPage);
});
