import { ref } from 'vue';

export const error = ref('');

export function setError(message) {
	error.value = message;
}
