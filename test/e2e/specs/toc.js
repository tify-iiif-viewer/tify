Feature('TOC');

Scenario('Navigate TOC', (I) => {
	I.amOnPage('http://localhost:8080/?manifestUrl=https://gdzdev.sub.uni-goettingen.de/iiif/presentation/PPN478508743_0018/manifest');
	I.waitForElement('.tify-app_main');

	I.click('Panel');
	I.click('Contents');
	I.see('Table of contents');
	I.see('Joh. Friedr. Wilh. Jerusalem', '.tify-toc_structure.-current');

	// "Des achtzehnten Bandes erstes Stück"
	I.click('.tify-toc_toggle + .tify-toc_link');
	I.see('Titelseite', '.tify-toc_structure.-current');

	// "Kurze Nachrichten"
	I.click('.tify-toc_structure[data-level="1"]:last-of-type .tify-toc_link');
	I.see('Das Staatsrecht nach der Vernunft', '.tify-toc_structure.-current');
	I.see('Heilige Reden', '.tify-toc_structure.-current');

	I.click('Hide children');
	I.dontSee('Titleseite');

	I.click('.tify-toc > .tify-toc_list > :last-child .tify-toc_link');
	I.see('Verzeichnis der Bücher', '.tify-toc_structure.-current');
});
