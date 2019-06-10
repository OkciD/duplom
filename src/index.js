import 'normalize.css';
import './styles/index.scss';
import * as VkApi from './modules/vkApi'
import { draw } from './modules/graph';
import queryString from './utils/queryString';
import getGroupId from './modules/grouper';
import deepmerge from 'deepmerge';

async function createFriendsGraphData(rootNode = { id: 0, caption: 'Я' }) {
	const { items: friends } = await VkApi.call(
		'friends.get',
		{
			...(rootNode.id) && { user_id: rootNode.id },
			order: 'name',
			fields: 'city,education'
		}
	);
	const groupingField = queryString.get('groupingField');

	return {
		nodes: [
			rootNode,
			...friends.map((friend) => {
				const { id, first_name, last_name } = friend;

				return {
					id,
					caption: `${first_name} ${last_name}`,
					group: getGroupId(friend, groupingField)
				}
			})
		],
		links: friends.map(({ id }) => ({
			source: rootNode.id,
			target: id,
			value: 1
		}))
	}
}

VkApi.init();

createFriendsGraphData()
	.then((graphData) => {
		const selectedFriendsIds = queryString.get('friends');

		// TODO: maybe this condition can be reduced to !Array.isArray
		if (!selectedFriendsIds || !Array.isArray(selectedFriendsIds)) {
			return graphData;
		}

		// TODO: eto pizdec, this needs to be refactored
		return selectedFriendsIds.reduce( // OMG, real promise sequence!
			(accumulatorPromise, selectedFriendId) => accumulatorPromise.then(async () =>
				deepmerge(
					graphData,
					await createFriendsGraphData(
						graphData.nodes.find(({ id }) => (+id === +selectedFriendId))
					)
				)
			),
			Promise.resolve()
		);
	})
	.then(async (graphData) => {
		await graphData.nodes.reduce(
			(accumulatorPromise, { id: friendId }) => accumulatorPromise.then(() =>
				VkApi.call('friends.getMutual', { target_uid: friendId })
					.then((mutualFriendsIds) => {
						graphData.links = [
							...graphData.links,
							...mutualFriendsIds.map((mutualFriendId) => ({
								source: friendId,
								target: mutualFriendId,
								value: 1
							}))
						]
					})
					.catch((error) => {
						if ([15, 100].includes(error.error_code)) {
							return;
						}

						throw error;
					})
			),
			Promise.resolve()
		);

		return graphData;
	})
	.then((graphData) => {
		draw(graphData);
	});
