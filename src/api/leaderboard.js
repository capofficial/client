import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'

import { leaderboard } from '@lib/stores'

export async function getLeaderboard(params) {

	const dataEndpoint = getChainData('dataEndpoint');

	if (!params) params = {};

	let { previous } = params;

	const now = new Date();

	const lastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
	const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
	const startLastMonth = startOfLastMonth.getTime() / 1000;

	const startThisMonth = parseInt((new Date(now.getFullYear(), now.getMonth(), 1)).getTime() / 1000);

	const nextMonth = new Date(now.getFullYear(), now.getMonth()+1,1);
	const endOfMonth = new Date(nextMonth.getTime()-1);
	const endThisMonth = parseInt(endOfMonth.getTime() / 1000);

	let start, end;
	if (previous) {
		start = startLastMonth;
		end = startThisMonth;
	} else {
		start = startThisMonth;
		end = endThisMonth;
	}

	try {
		const response = await fetch(`${dataEndpoint}/leaderboard?start=${start}&end=${end}`);
		const items = await response.json() || [];
		leaderboard.set(items);
	} catch(e) {
		console.error('/leaderboard GET error', params, e);
	}

	return true;
}