import 'normalize.css';
import './styles/index.scss';

import VK from 'vk-openapi';
import { draw } from './modules/graph';

const apiVersion = '5.95';
const appId = '6998698';

VK.init({ apiId: appId });

// TODO: reject
new Promise((resolve, reject) => {
	VK.Api.call(
		'friends.get',
		{
			order: 'name',
			fields: 'name',
			v: apiVersion
		},
		(response) => { resolve(response); }
	);
})
	.then(({ response }) => {
		console.log(response);

		return response;
	})
	.then((response) => {
		const friends = response.items;

		return {
			nodes: [
				{
					id: 0,
					caption: 'Я'
				},
				...friends.map(({ id, first_name, last_name }, index) => ({
					id,
					caption: `${first_name} ${last_name}`,
					group: index % 4
				}))
			],
			links: friends.map(({ id }) => ({
				source: 0,
				target: id
			}))
		}
	})
	.then((graphData) => {
		draw(graphData);
	});
