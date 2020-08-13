import axios from 'axios';

const httpClient = axios.create();

httpClient.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error),
);

export default httpClient;
