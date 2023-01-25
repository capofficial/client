import { get } from 'svelte/store'
import { onNewPrice } from '@lib/chart'
import { formatForDisplay } from '@lib/formatters'
import { prices, priceTimestamps, selectedMarket, marketInfos, ohlc, CAPPrice, positions } from '@lib/stores'
import { setPageTitle } from '@lib/ui'
import { getChainData } from '@lib/utils'

export async function getMarketPrices(markets) {
	
	const dataEndpoint = getChainData('dataEndpoint');
	const _selectedMarket = get(selectedMarket);
	
	if (!markets) {
		// markets should be selected market + market in position items
		markets = [_selectedMarket];
		const _positions = get(positions);
		for (const pos of _positions) {
			if (!markets.includes(pos.market)) markets.push(pos.market);
		}
	}
	
	try {
		const response = await fetch(`${dataEndpoint}/price/${markets == 'all' ? 'all' : markets.join(',')}`);
		const json = await response.json();
		// console.log('getMarketPrices json', json);
		// json: {market => [price, timestamp]}
		let dontUpdatePrice = {};
		for (const m in json) {
			const lastPriceTimestamp = get(priceTimestamps)[m];
			if (lastPriceTimestamp && lastPriceTimestamp * 1 >= json[m][1] * 1) {
				// sent timestamp is older than one we have, dont update
				dontUpdatePrice[m] = true;
				continue;
			}
			prices.update((p) => {
				p[m] = json[m][0];
				return p;
			});
			priceTimestamps.update((p) => {
				p[m] = json[m][1] / 1000;
				return p;
			});
		}
		return json;
	} catch(e) {
		console.error('/price GET error', markets, e);
	}
}

export async function getMarketTickers(market) {

	if (!market) return;

	const dataEndpoint = getChainData('dataEndpoint');
	try {
		const response = await fetch(`${dataEndpoint}/ticker/${market}`);
		const json = await response.json();

		// console.log('getMarketTickers json', json);
		// if market = all, json: {market => {o,h,l,c,t}}
		// if market, json: {o,h,l,c,t}

		if (market == 'all') {
			for (const m in json) {
				ohlc.update((x) => {
					x[m] = json[m];
					return x;
				});
			}
		} else {
			ohlc.update((x) => {
				x = json;
				return x;
			});
		}

		return json;
	} catch(e) {
		console.error('/ticker GET error', market, e);
	}
}

export async function getMarketCandles(params) {
	const dataEndpoint = getChainData('dataEndpoint');
	try {
		const response = await fetch(`${dataEndpoint}/candles/${params.market}?resolution=${params.resolution}&end=${params.end}`);
		const json = await response.json();
		return json;
	} catch(e) {
		console.error('/candles GET error', params, e);
	}
}

export async function getCAPPrice() {
	try {
		const response = await fetch('https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query: `
					query {
						token(id: "${getChainData('cap').toLowerCase()}") {
							tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
								close
							}
						}
					}`
			})
		});
		const json = await response.json();
		const price = json?.data?.token?.tokenDayData?.[0]?.close || 100;
		CAPPrice.set(price);
	} catch (e) {
		console.error('/getCAPPrice', e);
	}
}