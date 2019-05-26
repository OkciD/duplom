import 'normalize.css';
import './styles/style.scss';
import qs from 'qs';

const hashObject = qs.parse(window.location.hash.slice(1));

if (Object.keys(hashObject).length === 0) {
	const authQueryString = qs.stringify({
		client_id: '6998698',
		redirect_uri: 'http://localhost:8080',
		response_type: 'token',
		v: '5.95'
	});

	window.location.href = `https://oauth.vk.com/authorize?${authQueryString}`;
}

console.log(hashObject);

const { access_token: accessToken } = hashObject;

