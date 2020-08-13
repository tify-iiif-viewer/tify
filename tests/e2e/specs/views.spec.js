Feature('Views');

Scenario('Change view via buttons', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
	I.waitForElement('.tify-app_main');

	I.see('Info', '.-active');

	I.click('Fulltext');
	I.see('Fulltext', '.-active');

	I.click('Pages');
	I.see('Pages', '.-active');

	I.click('Contents');
	I.see('Contents', '.-active');

	I.click('Info');
	I.see('Info', '.-active');

	I.click('Export');
	I.see('Export', '.-active');

	I.click('Help');
	I.see('Help', '.-active');
}).tag('@smoke');

Scenario('Change view via keyboard', (I) => {
	I.resizeWindow(1600, 900);

	I.amOnPage('/?manifest=http://localhost:8081/manifest/wellcome-b18035723.json');
	I.waitForElement('.tify-app_main');

	I.pressKey('1');
	I.see('Fulltext', '.-active');

	I.pressKey('2');
	I.see('Pages', '.-active');

	I.pressKey('3');
	I.see('Contents', '.-active');

	I.pressKey('4');
	I.see('Info', '.-active');

	I.pressKey('5');
	I.see('Export', '.-active');

	I.pressKey('6');
	I.see('Help', '.-active');
});
