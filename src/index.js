import 'normalize.css';
import './styles/index.scss';
import * as VkApi from './modules/vkApi'
import { draw } from './modules/graph';

VkApi.init();

VkApi.call(
	'friends.get',
	{
		order: 'name',
		fields: 'name',
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
