/* global VK, alchemy */

import 'normalize.css';
import './styles/style.scss';

const apiVersion = '5.95';
const appId = '6998698';

VK.init({ apiId: appId });

VK.Api.call(
	'friends.get',
	{
		order: 'name',
		fields: 'name',
		v: apiVersion
	},
	(response) => { console.log(response); }
);

const some_data = {
	"nodes": [
		{
			"id": 1
		},
		{
			"id": 2
		},
		{
			"id": 3
		}
	],
	"edges": [
		{
			"source": 1,
			"target": 2
		},
		{
			"source": 1,
			"target": 3,
		}
	]
};

alchemy.begin({"dataSource": some_data});
