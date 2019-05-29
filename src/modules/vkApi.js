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
			console.log(`${method} call OK`, response);

			return response;
		})
		.catch((error) => {
			console.error(`${method} call ERROR`, error);

			throw error;
		})
}
