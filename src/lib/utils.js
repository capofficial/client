/**
 * Generates a shareable trade summary image using Canvas API.
 * @param {Object} trade - Trade or position object
 * @param {Object} opts - Optional overrides (theme, size)
 * @returns {Promise<Blob>} PNG blob ready for upload/share
 */
export async function generateTradeShareImage(trade, opts = {}) {
  const width = opts.width || 1200;
  const height = opts.height || 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  const bg = opts.bg || '#0B1220';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Accent bar
  const accent = trade.pnl >= 0 ? '#22C55E' : '#EF4444';
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, width, 8);

  // Title
  ctx.fillStyle = '#F1F5F9';
  ctx.font = 'bold 48px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'top';
  const sideLabel = (trade.side || trade.direction || '').toUpperCase();
  const market = (trade.market || trade.asset || '').toUpperCase();
  ctx.fillText(`${sideLabel} ${market}`, 60, 60);

  // PnL
  ctx.fillStyle = accent;
  ctx.font = 'bold 96px Inter, system-ui, sans-serif';
  const pnlValue = Number(trade.pnl ?? trade.realizedPnl ?? 0);
  const sign = pnlValue >= 0 ? '+' : '';
  const currency = trade.currency || 'USD';
  ctx.fillText(`${sign}${pnlValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`, 60, 160);

  // Metadata lines
  ctx.fillStyle = '#94A3B8';
  ctx.font = '32px Inter, system-ui, sans-serif';
  const entry = trade.entryPrice ?? trade.avgEntry ?? '-';
  const exit = trade.exitPrice ?? trade.avgExit ?? '-';
  const leverage = trade.leverage ? `${trade.leverage}x` : '-';
  const lines = [
    `Entry: ${entry}`,
    `Exit: ${exit}`,
    `Leverage: ${leverage}`,
    `Status: ${(trade.status || (trade.isOpen ? 'OPEN' : 'CLOSED')).toString().toUpperCase()}`
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, 60, 320 + i * 48);
  });

  // Branding footer
  ctx.fillStyle = '#64748B';
  ctx.font = '24px Inter, system-ui, sans-serif';
  ctx.fillText('Shared via CAP', 60, height - 40);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to generate trade share image'));
      resolve(blob);
    }, 'image/png');
  });
}

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
	if (!amount) return 0;
	const market = USD_CONVERSION_MARKETS[asset];
	if (!market) return amount; // USDC
	if (!_prices[market]) return 0;
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

export function getMargin(size, leverage) {
	return Number(((size || 0) / leverage).toFixed(4));
}
export function getSize(margin, leverage) {
	return Math.ceil(10**8 * (margin || 0) * leverage) / 10**8;
}