Feature('TOC');

Scenario('Navigate TOC', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=https://gdzstaging.sub.uni-goettingen.de/iiif/presentation/HANS_DE_7_w042081/manifest');
	I.waitForElement('.tify-app_main');

	I.click('Menu');
	I.click('Contents');
	I.see('Table of contents');
	I.see('Titelseite', '.tify-toc_structure.-current');

	I.click('.tify-toc_toggle + .tify-toc_link');
	I.dontSee('Table of contents');

	I.resizeWindow(1600, 900);
	I.click('Contents');
	I.see('Huddesche Methode', '.tify-toc_structure.-current');

	// "Kurze Nachrichten"
	I.click('.tify-toc_structure[data-level="1"]:last-of-type .tify-toc_link');
	I.see('Ferrarische Methode (Louis Ferrari)', '.tify-toc_structure.-current');

	I.click('Hide children');
	I.dontSee('Ferrarische Methode (Louis Ferrari)');

	I.click('.tify-toc > .tify-toc_list > :last-child .tify-toc_link');
	I.see('Einband', '.tify-toc_structure.-current');
});
