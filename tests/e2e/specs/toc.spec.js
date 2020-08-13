Feature('TOC');

Scenario('Navigate TOC', (I) => {
	I.amOnPage('/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');

	I.click('Contents');
	I.see('Table of Contents');
	I.see('Titelseite', '.tify-toc_structure.-current');

	I.click('.tify-toc_structure[data-level="0"]:nth-child(3) .tify-toc_toggle');

	I.click('.tify-toc_structure[data-level="0"].-expanded .tify-toc_structure[data-level="1"]:first-child .tify-toc_toggle');

	I.see('Huddesche Methode', '.tify-toc_label');

	// "Kurze Nachrichten"
	I.click('.tify-toc_structure[data-level="1"]:last-of-type .tify-toc_toggle');
	I.see('Ferrarische Methode (Louis Ferrari)', '.tify-toc_label');

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
}).tag('@smoke');

Scenario('Show TOC when there are structures without canvases', (I) => {
	const params = {
		view: 'toc',
	};
	const encodedParams = encodeURIComponent(JSON.stringify(params));

	I.amOnPage(`/?manifest=http://localhost:8081/manifest/MS-ADD-08640.json&tify=${encodedParams}`);
	I.waitForElement('.tify-app_main');

	I.see('Table of Contents');
	I.see('Elizabeth Lyttelton\'s commonplace book', '.tify-toc_structure.-current');
}).tag('@smoke');
