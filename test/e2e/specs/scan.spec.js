Feature('Scan');

Scenario('Control scan via keyboard', (I) => {
	I.amOnPage('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json');
	I.waitForElement('.tify-app_main');

	I.pressKey('r');
	I.see('Rotate', '.-active');

	I.pressKey('r');
	I.pressKey('r');
	I.pressKey('r');
	I.see('Rotate', ':not(.-active)');

	I.pressKey('f');
	I.see('Brightness');
	I.pressKey('f');
	I.dontSee('Brightness');

	I.pressKey('f');
	I.see('Brightness');
	I.pressKey('Esc');
	I.dontSee('Brightness');
});

Scenario('Reset pan, zoom, rotation and filters at once', (I) => {
	const params = {
		filters: {
			brightness: 1.1,
			contrast: 0.9,
			saturate: 1.1,
		},
		panX: .5,
		panY: .5,
		rotation: 90,
		zoom: 2,
	};
	const encodedParams = encodeURIComponent(JSON.stringify(params));

	I.amOnPage(`http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify=${encodedParams}`);
	I.waitForElement('.tify-app_main');

	I.see('Rotate', '.-active');
	I.see('Toggle image filters', '.-active');

	// TODO: Test disabled until Nightmare supports modifier keys
	// I.pressKey(['Shift', '0']);
	// I.seeCurrentUrlEquals('http://localhost:8080/?manifest=http://localhost:8081/manifest/gdz-HANS_DE_7_w042081.json&tify={"view":"info"}');
});
