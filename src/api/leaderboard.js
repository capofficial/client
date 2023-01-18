import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'

import { leaderboard } from '@lib/stores'

export async function getLeaderboard(params) {

	const dataEndpoint = getChainData('dataEndpoint');

	if (!params) params = {};

	let { start, end } = params;

	const now = new Date();

	if (!start) {
		// timestamp at beginning of this month
		start = parseInt((new Date(now.getFullYear(), now.getMonth(), 1)).getTime() / 1000);
	}
	if (!end) {
		// timestamp at end of this month
		const nextMonth = new Date(now.getFullYear(), now.getMonth()+1,1);
		const endOfMonth = new Date(nextMonth.getTime()-1);
		end = parseInt(endOfMonth.getTime() / 1000);
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