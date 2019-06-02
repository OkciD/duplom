import qs from 'qs';

const qsObject = qs.parse(window.location.search.replace(/^\?/, ''));

export default {
	has(key) {
		return qsObject.hasOwnProperty(key);
	},
	get(key, defaultValue) {
		return (this.has(key)) ? qsObject[key] : defaultValue;
	}
}
