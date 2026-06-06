- Add a final comment explaining the solution
- Make sure the output is correctly formatted with no extra text
---
// FILE: src/api/leaderboard.js
import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'

import { leaderboard, loserboard } from '@lib/stores'

export async function getLeaderboard(params) {

	const dataEndpoint = getChainData('dataEndpoint');

	if (!params) params = {};

	let { previous, losers } = params;

	const now = new Date();

	const lastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
	const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
	const startLastMonth = startOfLastMonth.getTime() / 1000;

	const startThisMonth = parseInt((new Date(now.getFullYear(), now.getMonth(), 1)).getTime() / 1000);

	let start, end;
	if (previous) {
		start = startLastMonth;
		end = startThisMonth;
	} else {
		start = startThisMonth;
		end = endThisMonth;
	}

	let losersQuery = '';
	if (losers) {
		losersQuery = '&losers=true';
	}

	try {
		const response = await fetch(`${dataEndpoint}/leaderboard?chain=arbitrum&start=${start}&end=${end}${losersQuery}`);
		const items = await response.json()