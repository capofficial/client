import { get } from 'svelte/store'

import { BPS_DIVIDER, CHAINDATA, USD_CONVERSION_MARKETS } from './config'
import { formatForDisplay } from './formatters'
import { chainId, leverage, selectedMarket, selectedMarketInfo } from './stores'

export function hashString(_string) {
  var hash = 0,
    i, chr;
  if (_string.length === 0) return hash;
  for (i = 0; i < _string.length; i++) {
    chr = _string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}


export function shortAddress(address) {
	if (!address) return;
	return address.substring(0,5) + '…' + address.slice(-4);
}

export function getUserSetting(key) {
	const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
	return userSettings[key];
}

export function saveUserSetting(key, value) {
	let userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
	userSettings[key] = value;
	localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

export function getPrecision(num) {
	num = num * 1;
	if (!num || isNaN(num) || Number.isInteger(num)) {
		return 0;
	}
	return num.toString().split('.')[1].length;
}

export function runAndInterval(method, interval) {
	method();
	const i1 = setInterval(method, interval);
	return i1;
}

export function setLeverageForSelectedMarket() {

	// set leverage for selected market
	const _leverage = get(leverage);
	const savedLeverage = getUserSetting(`leverage-${get(selectedMarket)}`);
	const marketInfo = get(selectedMarketInfo);

	if (!marketInfo.maxLeverage) return;

	if (savedLeverage && savedLeverage * 1 <= marketInfo.maxLeverage * 1) {
		leverage.set(savedLeverage);
	} else {
		leverage.set(marketInfo.maxLeverage * 1);
	}

}

export function getUPL(position, latestPrice) {
	let upl = 0;
	if (position.price * 1 == 0) return undefined;

	if (latestPrice) {
		if (position.isLong) {
			upl = position.size * (latestPrice * 1 - position.price * 1) / position.price;
		} else {
			upl = position.size * (position.price * 1 - latestPrice * 1) / position.price;
		}
	}
	return upl;
}

export function calculateLiquidationPrice(params) {
	const { liqThreshold, price, leverage, isLong } = params;
	if (!liqThreshold) return;
	let liquidationPrice;
	if (isLong) {
		liquidationPrice = price * (1 - liqThreshold / BPS_DIVIDER / leverage);
	} else {
		liquidationPrice = price * (1 + liqThreshold / BPS_DIVIDER / leverage);
	}
	return liquidationPrice;
}

export function getAmountInUsd(asset, amount, _prices) {
	const market = USD_CONVERSION_MARKETS[asset];
	return formatForDisplay((_prices[market] || 1) * amount * 1 || 0);
}

export function getTotalAmountInUsd(amounts, _prices) {
	// amounts = {ETH: ..., USDC: ...}
	// prices = {ETH-USD: .., BTC-USD: ..}
	let sum = 0;
	for (const asset in amounts) {
		const market = USD_CONVERSION_MARKETS[asset];
		const price = _prices[market] || 1;
		sum += price * amounts[asset] * 1;
	}
	return formatForDisplay(sum || 0);
}

export function getAssetAddress(label) {
	return getChainData('assets')[label];
}

export function getAssets() {
	return Object.keys(getChainData('assets'));
}

export function getAssetAddresses() {
	return Object.values(getChainData('assets'));
}

export function getLabelForAsset(_address) {
	const assets = getChainData('assets');
	for (const label in assets) {
		if (assets[label].toLowerCase() == _address.toLowerCase()) {
			return label;
		}
	}
}

export function getChainData(key) {
	const _chainId = get(chainId);
	if (!_chainId || !CHAINDATA[_chainId]) return;
	return CHAINDATA[_chainId][key];
}

export function getBufferBalances(items) {
	let balances = [];
	let ethBuffers = [];
	let usdcBuffers = [];
	let btcBuffers = [];
	let i;
	for (i=0; i<items.length; i++) {
		if(getLabelForAsset(items[i].asset) == "ETH"){
			ethBuffers.push(items[i].bufferBalance);
		}else if(getLabelForAsset(items[i].asset) == "USDC"){
			usdcBuffers.push(items[i].bufferBalance);
		}else if(getLabelForAsset(items[i].asset) == "WBTC"){
			btcBuffers.push(items[i].bufferBalance);
		}
	}
	balances["ETH"] = ethBuffers[0];
	balances["USDC"] = usdcBuffers[0];
	balances["WBTC"] = btcBuffers[0];
	return balances;
}

export function getMargin(size, leverage) {
	return Number(((size || 0) / leverage).toFixed(4));
}
export function getSize(margin, leverage) {
	return Math.ceil(10**8 * (margin || 0) * leverage) / 10**8;
}