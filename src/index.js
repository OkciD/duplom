import 'normalize.css';
import './styles/style.scss';

const apiVersion = '5.95';
const appId = '6998698';

VK.init({ apiId: appId });

VK.Api.call(
	'users.get',
	{
		user_ids: 225300011,
		v: apiVersion
	},
	(r) => { r.response && alert('Привет, ' + r.response[0].first_name) }
);
