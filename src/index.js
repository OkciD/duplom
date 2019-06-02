import 'normalize.css';
import './styles/index.scss';
import * as VkApi from './modules/vkApi'
import { draw } from './modules/graph';

VkApi.init();

VkApi.call(
	'friends.get',
	{
		order: 'name',
		fields: 'city,education'
	}
)
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
					caption: `${first_name} ${last_name}`,
					group: 1
				}))
			],
			links: friends.map(({ id }) => ({
				source: 0,
				target: id,
				value: 1
			}))
		}
	})
	.then(async (graphData) => { // OMG, real promise sequence!
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
