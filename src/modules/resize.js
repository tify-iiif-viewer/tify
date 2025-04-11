const instances = [];

function getInstance(el, callback) {
	return instances.find((instance) => {
		const callbackName = callback.name.replace(/bound /g, '');
		return instance.el === el && instance.callbackName === callbackName;
	});
}

export function createResizeObserver(el, callback) {
	if (getInstance(el, callback)) {
		return;
	}

	const instance = {
		el,
		callbackName: callback.name.replace(/bound /g, ''),
		timeout: null,
	};

	instance.resizeObserver = new ResizeObserver(() => {
		if (!instance.timeout) {
			callback();
			instance.timeout = -1;
			return;
		}

		clearTimeout(instance.timeout);

		instance.timeout = setTimeout(callback, 100);
	});

	instance.resizeObserver.observe(el);

	instances.push(instance);
}

export function destroyResizeObserver(el, callback) {
	const instance = getInstance(el, callback);

	if (!instance) {
		return;
	}

	instance.resizeObserver?.disconnect();
	clearTimeout(instance.timeout);

	const instanceIndex = instances.findIndex((ins) => ins.el === el && ins.callbackName === instance.callbackName);
	instances.splice(instanceIndex, 1);
}
