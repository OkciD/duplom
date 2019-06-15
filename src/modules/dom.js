import queryString from '../utils/queryString';

const buttonContainer = document.querySelector('.buttons-container');

export function createButtons() {
	createButton('Группировка по городу', () => {
		queryString.set('groupBy', 'city');
	});
	createButton('Группировка по университету', () => {
		queryString.set('groupBy', 'university');
	});
	createButton('Отменить группировку', () => {
		queryString.remove('groupBy');
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
	const preloader = document.querySelector('.preloader-container');

	preloader.style.display = 'none';
}
