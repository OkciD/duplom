import VK from 'vk-openapi';
import queryString from '../utils/queryString';

const API_VERSION = '5.95';
const APP_ID = '6998698';
const NO_CACHE_PARAM_NAME = 'noCache';
const DROP_CACHE_PARAM_NAME = 'dropCache';

const noCache = queryString.has(NO_CACHE_PARAM_NAME);
const dropCache = queryString.has(DROP_CACHE_PARAM_NAME);

export function sleep(ms = 300) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function init() {
	VK.init({ apiId: APP_ID });
	VK.Auth.login(
		() => {},
		2 // https://vk.com/dev/permissions
	);

	if (dropCache) {
		localStorage.clear();
	}
}

export async function call(method, data) {
	const localStorageKey = `vkApi:${method}:${JSON.stringify(data)}`;
	const cachedResponseJson = localStorage.getItem(localStorageKey);

	if (!noCache && cachedResponseJson) {
		const cachedResponse = JSON.parse(cachedResponseJson);

		if (cachedResponse.hasOwnProperty('error_code') || cachedResponse.hasOwnProperty('error_msg')) {
			return Promise.reject(cachedResponse);
		}

		return Promise.resolve(cachedResponse);
	}

	await sleep();

	return new Promise((resolve, reject) => {
		VK.Api.call(
			method,
			{
				...data,
				v: API_VERSION
			},
			({ response, error }) => error ? reject(error) : resolve(response)
		)
	})
		.then((response) => {
			console.groupCollapsed(`${method} called %c OK`, 'color: green');
			console.log('args', data);
			console.log('response', response);
			console.groupEnd();

			if (!noCache) {
				localStorage.setItem(localStorageKey, JSON.stringify(response));
			}

			return response;
		})
		.catch((error) => {
			console.groupCollapsed(`${method} called %c ERROR`, 'color: red');
			console.log('args', data);
			console.log('error', error);
			console.groupEnd();

			if (!noCache) {
				localStorage.setItem(localStorageKey, JSON.stringify(error));
			}

			throw error;
		})
}
