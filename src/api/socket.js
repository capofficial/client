import { get } from 'svelte/store'
import { PriceServiceConnection } from "@pythnetwork/pyth-common-js";
import { Buffer } from "buffer";
import { prices, marketInfos, priceTimestamps } from '@lib/stores'

export class EvmPriceServiceConnection extends PriceServiceConnection {
  /**
   * Gets price update data which then can be submitted to Pyth contract to update the prices.
   * This will throw an axios error if there is a network problem or the price service returns a non-ok response (e.g: Invalid price ids)
   *
   * @param priceIds Array of hex-encoded price ids.
   * @returns Array of price update data.
   */
  async getPriceFeedsUpdateData(priceIds) {
    const latestVaas = await this.getLatestVaas(priceIds);
    return latestVaas.map(
      (vaa) => "0x" + Buffer.from(vaa, "base64").toString("hex")
    );
  }
}

let connection, t, i1;

export function connectSocket() {

	clearTimeout(t);
	clearInterval(i1);

	if (connection) {
		connection.closeWebSocket();
	}

	const _marketInfos = get(marketInfos);

	if (!_marketInfos || !_marketInfos['BTC-USD']) {
		// Markets not ready yet, retry
		t = setTimeout(connectSocket, 2 * 1000);
		return;
	}

	connection = new EvmPriceServiceConnection("https://xc-mainnet.pyth.network");

	// map market => feedId and feedId => market
	let priceIds = [];
	let pythFeedToMarket = {};
	for (const market in _marketInfos) {
		const marketInfo = _marketInfos[market];
		priceIds.push(marketInfo.pythFeed);
		pythFeedToMarket[marketInfo.pythFeed] = market;
	}

	// console.log('priceIds', priceIds);

	// // TEST
	// priceIds = [
	//   // You can find the ids of prices at https://pyth.network/developers/price-feed-ids#pyth-evm-testnet
	//   "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b", // BTC/USD price id in testnet
	//   "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6", // ETH/USD price id in testnet
	// ];
	// pythFeedToMarket = {
	// 	'0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b': 'BTC-USD',
	// 	'0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6': 'ETH-USD'
	// };

	let _prices = {};
	let _priceTimestamps = {};

	connection.subscribePriceFeedUpdates(priceIds, (priceFeed) => {
		const feedId = `0x${priceFeed.id}`;
		const market = pythFeedToMarket[feedId];
		// console.log(`Received update for ${feedId} (${market})`);
		const priceObj = priceFeed.getPriceNoOlderThan(60);
		if (priceObj) {

			try {
				// convert price to decimal without exponent and extra 0s
				const price = priceObj.price / 10**(-1 * priceObj.expo);
				// console.log(market, price);
				// if (market != 'BTC-USD') return;
				_prices[market] = price;
				_priceTimestamps[market] = Date.now() / 1000;
			} catch(e) {
				console.error(e);
			}

		} // else price is stale
	});

	// throttle store updates
	i1 = setInterval(() => {
		for (const market in _prices) {
			prices.update((p) => {
				p[market] = _prices[market];
				return p;
			});
			priceTimestamps.update((p) => {
				p[market] = _priceTimestamps[market];
				return p;
			});
		}
		_prices = {};
		_priceTimestamps = {};
	}, 1000);

}

export function closeSocket() {
	if (connection) {
		connection.closeWebSocket();
	}
}