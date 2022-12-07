import { get } from 'svelte/store'
import { ADDRESS_ZERO } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits } from '@lib/formatters'
import { chainlinkPrice, selectedMarketInfo } from '@lib/stores'

export async function getChainlinkPrice() {
	// console.log('getChainlinkPrice');
	const contract = await getContract('Chainlink');
	const marketInfo = get(selectedMarketInfo);
	if (!marketInfo.chainlinkFeed || marketInfo.chainlinkFeed == ADDRESS_ZERO) {
		chainlinkPrice.set();
		return;
	}
	chainlinkPrice.set(formatUnits(await contract.getPrice(marketInfo.chainlinkFeed)));
}