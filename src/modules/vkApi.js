import VK from 'vk-openapi';
import queryString from '../utils/queryString';
import { API_VERSION, APP_ID, DROP_CACHE_PARAM_NAME, NO_CACHE_PARAM_NAME } from '../utils/constants';

const noCache = queryString.has(NO_CACHE_PARAM_NAME);
const dropCache = queryString.has(DROP_CACHE_PARAM_NAME);

if (dropCache) {
	localStorage.clear();
}

let selfSessionData = {};

export function init() {
	return new Promise(((resolve) => {
		VK.init({ apiId: APP_ID });
		VK.Auth.login(
			({ session }) => {
				selfSessionData = session;
				resolve();
			},
			2 // https://vk.com/dev/permissions
		);
	}));
}

export function getSelf() {
	return  selfSessionData.user;
}

function _sleep(ms = 350) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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

	await _sleep();

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
