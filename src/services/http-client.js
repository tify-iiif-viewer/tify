import axios from 'axios';

const httpClient = axios.create();

/** Adding the request interceptors */
// httpClient.interceptors.request.use(authInterceptor);
// httpClient.interceptors.request.use(loggerInterceptor);

httpClient.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error),
);

export default httpClient;
