import { getChainData } from '@lib/utils'

export async function getTransactions(queryString) {

	const dataEndpoint = getChainData('dataEndpoint');

	try {
		const response = await fetch(`${dataEndpoint}/transactions?${queryString}`);
		return await response.json();
	} catch(e) {
		console.error('/transactions GET error', e);
	}

}