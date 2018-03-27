Feature('TOC');

Scenario('Navigate TOC', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');

	I.click('View');
	I.click('Contents');
	I.see('Table of Contents');
	I.see('Titelseite', '.tify-toc_structure.-current');

	I.click('.tify-toc_toggle + .tify-toc_link');
	I.dontSee('Table of Contents');

	I.resizeWindow(1600, 900);
	I.click('Contents');
	I.see('Huddesche Methode', '.tify-toc_structure.-current');

	// "Kurze Nachrichten"
	I.click('.tify-toc_structure[data-level="1"]:last-of-type .tify-toc_link');
	I.see('Ferrarische Methode (Louis Ferrari)', '.tify-toc_structure.-current');

	I.click('Collapse');
	I.dontSee('Ferrarische Methode (Louis Ferrari)');

	I.click('.tify-toc > .tify-toc_list > :last-child .tify-toc_link');
	I.see('Einband', '.tify-toc_structure.-current');

	I.click('Expand all');
	I.click('Expand all'); // Multiple clicks should not toggle all children again
	I.see('Auflösung von Gleichungen 3ten Grades');
	I.see('Recursionsformeln');

	I.click('Collapse all');
	I.click('Collapse all'); // Multiple clicks should not toggle all children again
	I.dontSee('Auflösung von Gleichungen 3ten Grades');
	I.dontSee('Recursionsformeln');

	I.click('Expand all');
	I.click('.tify-toc_toggle:first-of-type'); // collapse first collapsible
	I.dontSee('Auflösung von Gleichungen 3ten Grades'); // child of first collapsible
	I.see('Recursionsformeln'); // child of second collapsible

	// Browser may be "restarted" between tests, but window size is not reset.
	I.resizeWindow(800, 600);
});
