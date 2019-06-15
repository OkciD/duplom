import 'normalize.css';
import './styles/index.scss';
import * as VkApi from './modules/vkApi'
import { draw } from './modules/graph';
import queryString from './utils/queryString';
import cartesian from 'cartesian';
import getGroupId from './modules/grouper';

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

	// фильтруем айдишники выбранных друзей: оставляем только те, которые реально принадлежат нашим друзьям
	const selectedFriendsIds = queryString.get('select', [])
		.filter((friendToExpandId) => selfFriends.find(({ id }) => id === +friendToExpandId));

	for (const friendId of selectedFriendsIds) {
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
	}

	const getMutualPairs = cartesian([
		graphData.nodes.map(({ id }) => id),
		[+selfId, ...selectedFriendsIds],
	]);

	for (const [sourceId, targetId] of getMutualPairs) {
		if (sourceId === targetId) {
			continue;
		}

		const mutualFriendsIds = await VkApi.call('friends.getMutual', {
			source_uid: sourceId,
			target_uid: targetId
		}).catch((error) => {
			if ([15, 30].includes(error.error_code)) {
				return [];
			}

			throw error;
		});

		graphData.links = [
			...graphData.links,
			...mutualFriendsIds.map((mutualFriendId) => ({
				source: sourceId,
				target: mutualFriendId,
				value: 1
			}))
		];
	}

	draw(graphData);
})();
