import qs from 'qs';

const qsObject = qs.parse(window.location.search.replace(/^\?/, ''));

export default {
	has(key) {
		return qsObject.hasOwnProperty(key);
	},
	get(key, defaultValue) {
		return (this.has(key)) ? qsObject[key] : defaultValue;
	},
	set(key, value, isArray = false) {
		if (Array.isArray(qsObject[key])) {
			qsObject[key].push(value)
		} else {
			qsObject[key] = (isArray) ? [value] : value
		}

		window.location.search = `?${qs.stringify(qsObject)}`;
	},
	remove(key) {

	}
}
