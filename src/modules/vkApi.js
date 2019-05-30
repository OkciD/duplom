import VK from 'vk-openapi';

const apiVersion = '5.95';
const appId = '6998698';

export function sleep(ms = 300) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function init() {
	VK.init({ apiId: appId });
	VK.Auth.login(
		() => {},
		2 // https://vk.com/dev/permissions
	);
}

export async function call(method, data) {
	await sleep();

	return new Promise((resolve, reject) => {
		VK.Api.call(
			method,
			{
				...data,
				v: apiVersion
			},
			({ response, error }) => error ? reject(error) : resolve(response)
		)
	})
		.then((response) => {
			console.groupCollapsed(`${method} called %c OK`, 'color: green');
			console.log('args', data);
			console.log('response', response);
			console.groupEnd();

			return response;
		})
		.catch((error) => {
			console.groupCollapsed(`${method} called %c ERROR`, 'color: red');
			console.log('args', data);
			console.log('error', error);
			console.groupEnd();

			throw error;
		})
}
