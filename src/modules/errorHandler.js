import { reactive } from 'vue';

export const errorHandler = reactive({
	messages: [],
	add(message) {
		this.messages.push(message);
	},
	clear() {
		this.messages = [];
	},
});
