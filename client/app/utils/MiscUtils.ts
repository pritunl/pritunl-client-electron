/// <reference path="../References.d.ts"/>
export function uuid(): string {
	return (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
}

export function objectIdNil(objId: string): boolean {
	return !objId || objId == '000000000000000000000000';
}

export function zeroPad(num: number, width: number): string {
	if (num < Math.pow(10, width)) {
		return ('0'.repeat(width - 1) + num).slice(-width);
	}
	return num.toString();
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatAmount(amount: number): string {
	if (!amount) {
		return '-';
	}
	return '$' + (amount / 100).toFixed(2);
}

export function formatDate(dateStr: string): string {
	if (!dateStr || dateStr === '0001-01-01T00:00:00Z') {
		return '';
	}

	let date = new Date(dateStr);
	let str = '';

	let hours = date.getHours();
	let period = 'AM';

	if (hours > 12) {
		period = 'PM';
		hours -= 12;
	} else if (hours === 0) {
		hours = 12;
	}

	let day;
	switch (date.getDay()) {
		case 0:
			day = 'Sun';
			break;
		case 1:
			day = 'Mon';
			break;
		case 2:
			day = 'Tue';
			break;
		case 3:
			day = 'Wed';
			break;
		case 4:
			day = 'Thu';
			break;
		case 5:
			day = 'Fri';
			break;
		case 6:
			day = 'Sat';
			break;
	}

	let month;
	switch (date.getMonth()) {
		case 0:
			month = 'Jan';
			break;
		case 1:
			month = 'Feb';
			break;
		case 2:
			month = 'Mar';
			break;
		case 3:
			month = 'Apr';
			break;
		case 4:
			month = 'May';
			break;
		case 5:
			month = 'Jun';
			break;
		case 6:
			month = 'Jul';
			break;
		case 7:
			month = 'Aug';
			break;
		case 8:
			month = 'Sep';
			break;
		case 9:
			month = 'Oct';
			break;
		case 10:
			month = 'Nov';
			break;
		case 11:
			month = 'Dec';
			break;
	}

	str += day + ' ';
	str += date.getDate() + ' ';
	str += month + ' ';
	str += date.getFullYear() + ', ';
	str += hours + ':';
	str += zeroPad(date.getMinutes(), 2) + ':';
	str += zeroPad(date.getSeconds(), 2) + ' ';
	str += period;

	return str;
}

export function formatDateShort(dateStr: string): string {
	if (!dateStr || dateStr === '0001-01-01T00:00:00Z') {
		return '';
	}

	let date = new Date(dateStr);
	let curDate = new Date();

	let month;
	switch (date.getMonth()) {
		case 0:
			month = 'Jan';
			break;
		case 1:
			month = 'Feb';
			break;
		case 2:
			month = 'Mar';
			break;
		case 3:
			month = 'Apr';
			break;
		case 4:
			month = 'May';
			break;
		case 5:
			month = 'Jun';
			break;
		case 6:
			month = 'Jul';
			break;
		case 7:
			month = 'Aug';
			break;
		case 8:
			month = 'Sep';
			break;
		case 9:
			month = 'Oct';
			break;
		case 10:
			month = 'Nov';
			break;
		case 11:
			month = 'Dec';
			break;
	}

	let str = month + ' ' + date.getDate();

	if (date.getFullYear() !== curDate.getFullYear()) {
		str += ' ' + date.getFullYear();
	}

	return str;
}

export function formatDateShortTime(dateStr: string): string {
	if (!dateStr || dateStr === '0001-01-01T00:00:00Z') {
		return '';
	}

	let date = new Date(dateStr);
	let curDate = new Date();

	let month;
	switch (date.getMonth()) {
		case 0:
			month = 'Jan';
			break;
		case 1:
			month = 'Feb';
			break;
		case 2:
			month = 'Mar';
			break;
		case 3:
			month = 'Apr';
			break;
		case 4:
			month = 'May';
			break;
		case 5:
			month = 'Jun';
			break;
		case 6:
			month = 'Jul';
			break;
		case 7:
			month = 'Aug';
			break;
		case 8:
			month = 'Sep';
			break;
		case 9:
			month = 'Oct';
			break;
		case 10:
			month = 'Nov';
			break;
		case 11:
			month = 'Dec';
			break;
	}

	let str = month + ' ' + date.getDate();

	if (date.getFullYear() !== curDate.getFullYear()) {
		str += ' ' + date.getFullYear();
	} else if (date.getMonth() === curDate.getMonth() &&
			date.getDate() === curDate.getDate()) {
		let hours = date.getHours();
		let period = 'AM';

		if (hours > 12) {
			period = 'PM';
			hours -= 12;
		} else if (hours === 0) {
			hours = 12;
		}

		str = hours + ':';
		str += zeroPad(date.getMinutes(), 2) + ':';
		str += zeroPad(date.getSeconds(), 2) + ' ';
		str += period;
	}

	return str;
}
