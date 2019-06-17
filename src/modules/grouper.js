const groupData = {};
let groupCounter = 0;

export default function getGroupId(friend, groupingParam) {
	switch (groupingParam) {
		case 'city': {
			return groupByCity(friend.city)
		}
		case 'university': {
			return groupByUniversity({
				id: friend.university,
				name: friend.university_name
			})
		}
	}
}

export function getGroupsMap() {
	return Object.values(groupData).reduce((result, { groupId, data: { name } }) => ({
		...result,
		[groupId]: name
	}), {});
}

function groupByUniversity(universityData) {
	const {
		id: universityId,
		name: universityName
	} = universityData;

	if (!universityId) {
		return undefined;
	}

	if (!groupData.hasOwnProperty(universityId)) {
		groupData[universityId] = {
			groupId: ++groupCounter,
			data: {
				name: universityName
			}
		};
	}

	return groupData[universityId].groupId;
}

function groupByCity(cityData) {
	if (!cityData) {
		return undefined;
	}

	const {
		id: cityId,
		title: cityName
	} = cityData;

	if (!groupData.hasOwnProperty(cityId)) {
		groupData[cityId] = {
			groupId: ++groupCounter,
			data: {
				name: cityName
			}
		};
	}

	return groupData[cityId].groupId;
}
