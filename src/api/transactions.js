import { getChainData } from '@lib/utils'

export async function getTransactions(queryString) {

	const pricesEndpoint = getChainData('pricesEndpoint');

	try {
		const response = await fetch(`${pricesEndpoint}/transactions?${queryString}`);
		return await response.json();
	} catch(e) {
		console.error('/transactions GET error', e);
	}

}