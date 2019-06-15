import 'normalize.css';
import './styles/index.scss';
import * as VkApi from './modules/vkApi'
import { draw } from './modules/graph';
import queryString from './utils/queryString';
import getGroupId from './modules/grouper';
import deepmerge from 'deepmerge';

import 'regenerator-runtime/runtime';

function getFriends(userId) {
	return VkApi.call(
		'friends.get',
		{
			user_id: userId,
			order: 'name',
			fields: 'city,education'
		}
	).then((response) => response.items);
}

(async () => {
	await VkApi.init();

	// данные для отображения в графе
	const graphData = {
		nodes: [],
		links: []
	};

	const { id: selfId, first_name: selfFirstName, last_name: selfLastName } = VkApi.getSelf();

	// добавляем в граф узел для себя
	graphData.nodes.push({
		id: +selfId,
		caption: `${selfFirstName} ${selfLastName}`
	});

	const selfFriends = await getFriends(selfId);

	// добавляем в граф узлы друзей
	graphData.nodes = [
		...graphData.nodes,
		...selfFriends.map(({ id, first_name, last_name }) => ({
			id,
			caption: `${first_name} ${last_name}`
		}))
	];

	// добавляем связи между собой и своими друзьями
	graphData.links = selfFriends.map(({ id }) => ({
		source: id,
		target: selfId,
		value: 1
	}));

	const selectedFriends = queryString.get('select', []);

	await selectedFriends
		// фильтруем переданные айдишники: оставляем только те, которые реально принадлежат нашим друзьям
		.filter((friendToExpandId) => selfFriends.find(({ id }) => id === +friendToExpandId))
		// это такой forEach, только в нём следующая итерация не начнётся, пока не завершится текущая
		.reduce((accumulatorPromise, friendId) => accumulatorPromise.then(async () => {
			const friendsFriends = await getFriends(friendId);

			const newFriends = friendsFriends
				.filter(({ id }) => !graphData.nodes.find(({ id: nodeId }) => nodeId === id));

			graphData.nodes = [
				...graphData.nodes,
				...newFriends.map(({ id, first_name, last_name }) => ({
					id,
					caption: `${first_name} ${last_name}`
				}))
			];
			graphData.links = [
				...graphData.links,
				...friendsFriends.map(({ id }) => ({
					source: id,
					target: friendId,
					value: 1
				}))
			]
		}), Promise.resolve());

	draw(graphData);
})();
