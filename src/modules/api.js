import { options } from './store';

export function expose(method, name) {
	options.root[name || method.name.replace('bound ', '')] = method;
}
