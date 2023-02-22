import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'

import { address, stats } from '@lib/stores'

export async function getStats(params) {

	const dataEndpoint = getChainData('dataEndpoint');

	const now = new Date();

	const month = now.toLocaleString('en-US', { month: 'short' }) + "-" + now.getFullYear();

	try {
		const response = await fetch(`${dataEndpoint}/stats?chain=arbitrum&month=${month}&user=${get(address)}`);
		const items = await response.json() || {};
		stats.set(items);
	} catch(e) {
		console.error('/stats GET error', params, e);
	}

	return true;
}