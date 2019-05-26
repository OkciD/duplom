/* global VK */

import 'normalize.css';
import './styles/style.scss';

const apiVersion = '5.95';
const appId = '6998698';

VK.init({ apiId: appId });

VK.Api.call(
	'friends.get',
	{
		order: 'name',
		fields: 'city,domain,sex,universities',
		v: apiVersion
	},
	(response) => { console.log(response); }
);
