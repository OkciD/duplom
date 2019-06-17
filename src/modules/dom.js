import queryString from '../utils/queryString';
import {
	BUTTONS_CONTAINER_LOCATOR,
	GROUPING_PARAM_NAME,
	LEGEND_CONTAINER_LOCATOR,
	PRELOADER_CONTAINER_LOCATOR
} from '../utils/constants';

const buttonContainer = document.querySelector(BUTTONS_CONTAINER_LOCATOR);

function _createButton(title, onClick) {
	const button = document.createElement('button');
	button.innerText = title;
	button.className = 'button';
	button.addEventListener('click', onClick);

	buttonContainer.append(button);
}

export function createButtons() {
	if (!buttonContainer) {
		console.error('No button container found!');
		return;
	}

	_createButton('Группировка по городу', () => {
		queryString.set(GROUPING_PARAM_NAME, 'city');
	});
	_createButton('Группировка по университету', () => {
		queryString.set(GROUPING_PARAM_NAME, 'university');
	});
	_createButton('Отменить группировку', () => {
		queryString.remove(GROUPING_PARAM_NAME);
	});
}

export function createLegend(legendData) {
	const legendContainer = document.querySelector(LEGEND_CONTAINER_LOCATOR);

	if (!legendContainer) {
		console.error('No legend container found!');
		return;
	}

	legendData.forEach(([colour, title]) => {
		const row = document.createElement('div');
		row.className = 'legend-row';

		const colourPreview = document.createElement('div');
		colourPreview.className = 'legend-row__colour';
		colourPreview.style.backgroundColor = colour;
		row.append(colourPreview);

		const titleString = document.createElement('span');
		titleString.className = 'legend-row__title';
		titleString.innerText = title;
		row.append(titleString);

		legendContainer.append(row);
	});
}

export function hidePreloader() {
	const preloader = document.querySelector(PRELOADER_CONTAINER_LOCATOR);

	if (!preloader) {
		console.error('No preloader container found!');
		return;
	}

	preloader.style.display = 'none';
}
