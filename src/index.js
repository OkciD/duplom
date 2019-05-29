import 'normalize.css';
import './index.scss';

import VK from 'vk-openapi';
import alchemy from 'alchemy';

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
				...friends.map(({ id, first_name, last_name }) => ({
					id,
					caption: `${first_name} ${last_name}`
				}))
			],
			edges: friends.map(({ id }) => ({
				source: 0,
				target: id
			}))
		}
	})
	.then((graphData) => {
		alchemy.begin({
			dataSource: graphData
		});
	});
