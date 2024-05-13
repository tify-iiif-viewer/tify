export function createPromise() {
	let resolveFunction;
	let rejectFunction;

	const promise = new Promise((resolve, reject) => {
		resolveFunction = resolve;
		rejectFunction = reject;
	});

	promise.resolve = resolveFunction;
	promise.reject = rejectFunction;

	return promise;
}
