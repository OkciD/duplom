import qs from 'qs';

const qsObject = qs.parse(decodeURIComponent(window.location.search).replace(/^\?/, ''));

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
	remove(key, value) {
		if (Array.isArray(qsObject[key]) && value) {
			qsObject[key] = qsObject[key].filter((item) => item !== `${value}`);

			if (qsObject[key].length === 0) {
				delete qsObject[key];
			}
		} else {
			delete qsObject[key];
		}

		window.location.search = `?${qs.stringify(qsObject)}`;
	}
}
