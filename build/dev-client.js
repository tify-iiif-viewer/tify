/* eslint-disable import/no-extraneous-dependencies */
require('eventsource-polyfill');
const hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true');

hotClient.subscribe((event) => {
	if (event.action === 'reload') {
		window.location.reload();
	}
});
