import VK from 'vk-openapi';

const apiVersion = '5.95';
const appId = '6998698';

export function init() {
	VK.init({ apiId: appId });
}

export function call(method, data) {
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
			console.group(`${method} called %c OK`, 'color: green');
			console.log('args', data);
			console.log('response', response);
			console.groupEnd();

			return response;
		})
		.catch((error) => {
			console.group(`${method} called %c ERROR`, 'color: red');
			console.log('args', data);
			console.log('error', error);
			console.groupEnd();

			throw error;
		})
}
