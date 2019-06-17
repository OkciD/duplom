import 'normalize.css';
import './styles/index.scss';
import * as VkApi from './modules/vkApi'
import { draw } from './modules/graph';
import queryString from './utils/queryString';
import cartesian from 'cartesian';
import getGroupId, { getGroupsMap } from './modules/grouper';
import { createButtons, createLegend, hidePreloader } from './modules/dom';
import { GROUPING_PARAM_NAME, SELECTED_FRIENDS_PARAM_NAME, SELF_ID_PARAM_NAME } from './utils/constants';

import 'regenerator-runtime/runtime';
import colours from './utils/colours';

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
	const groupingParam = queryString.get(GROUPING_PARAM_NAME);

	const selfId = queryString.get(SELF_ID_PARAM_NAME, VkApi.getSelf().id);
	const [{ first_name: selfFirstName, last_name: selfLastName }] = await VkApi.call('users.get', { user_ids: selfId });

	// добавляем в граф узел для себя
	graphData.nodes.push({
		id: +selfId,
		caption: `${selfFirstName} ${selfLastName}`,
		isSelf: true
	});

	const selfFriends = await getFriends(selfId);

	// фильтруем айдишники выбранных друзей: оставляем только те, которые реально принадлежат нашим друзьям
	const selectedFriendsIds = queryString.get(SELECTED_FRIENDS_PARAM_NAME, [])
		.map((selectedFriendId) => +selectedFriendId)
		.filter(Boolean)
		.filter((selectedFriendId) => selfFriends.find(({ id }) => id === selectedFriendId));

	// добавляем в граф узлы друзей
	graphData.nodes = [
		...graphData.nodes,
		...selfFriends.map((friend) => ({
			id: friend.id,
			caption: `${friend.first_name} ${friend.last_name}`,
			group: getGroupId(friend, groupingParam),
			isSelected: selectedFriendsIds.includes(friend.id)
		}))
	];

	// добавляем связи между собой и своими друзьями
	graphData.links = selfFriends.map(({ id }) => ({
		source: id,
		target: selfId,
		value: 1
	}));

	for (const friendId of selectedFriendsIds) {
		const friendsFriends = await getFriends(friendId);

		const newFriends = friendsFriends
			.filter(({ id }) => !graphData.nodes.find(({ id: nodeId }) => nodeId === id));

		graphData.nodes = [
			...graphData.nodes,
			...newFriends.map((friend) => ({
				id: friend.id,
				caption: `${friend.first_name} ${friend.last_name}`,
				group: getGroupId(friend, groupingParam)
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

	if (queryString.has(GROUPING_PARAM_NAME)) {
		const groupsMap = getGroupsMap();
		const legendData = Object.entries(groupsMap).map(([groupId, groupName]) => ([colours[+groupId], groupName]));

		createLegend(legendData);
	}

	hidePreloader();
	createButtons();
	draw(graphData);
})();
