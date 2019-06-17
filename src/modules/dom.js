import queryString from '../utils/queryString';
import { BUTTONS_CONTAINER_LOCATOR, GROUPING_PARAM_NAME, PRELOADER_CONTAINER_LOCATOR } from '../utils/constants';

const buttonContainer = document.querySelector(BUTTONS_CONTAINER_LOCATOR);

export function createButtons() {
	createButton('Группировка по городу', () => {
		queryString.set(GROUPING_PARAM_NAME, 'city');
	});
	createButton('Группировка по университету', () => {
		queryString.set(GROUPING_PARAM_NAME, 'university');
	});
	createButton('Отменить группировку', () => {
		queryString.remove(GROUPING_PARAM_NAME);
	});
}

function createButton(title, onClick) {
	const button = document.createElement('button');
	button.innerText = title;
	button.className = 'button';
	button.addEventListener('click', onClick);

	buttonContainer.append(button);
}

export function hidePreloader() {
	const preloader = document.querySelector(PRELOADER_CONTAINER_LOCATOR);

	preloader.style.display = 'none';
}
