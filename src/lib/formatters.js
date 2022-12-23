import { get } from 'svelte/store'
import { ethers } from 'ethers'
import { ADDRESS_ZERO, BPS_DIVIDER, MAX_CAP_DISPLAY_DECIMALS } from './config'
import { locale } from './stores'
import { getLabelForAsset } from './utils'

export function formatUnits(amount, decimals) {
	if (!amount) return 0;
	return ethers.utils.formatUnits(amount || 0, decimals || 18);
}

export function parseUnits(amount, decimals) {
	if (!amount || isNaN(amount)) amount = '0';
	if (typeof(amount) == 'number') amount = "" + amount;
	return ethers.utils.parseUnits(amount, decimals || 18);
}

export function createOrderTuple(params) {

	return {
		orderId: 0,
		user: ADDRESS_ZERO,
		asset: params.asset,
		market: params.market,
		margin: params.margin,
		size: params.size,
		price: params.price || 0,
		fee: params.fee || 0,
		isLong: params.isLong,
		orderType: params.orderType || 0,
		isReduceOnly: params.isReduceOnly || false,
		timestamp: 0,
		expiry: params.expiry || 0,
		cancelOrderId: params.cancelOrderId || 0
	};

}

export function getLabelForKey(key) {
	switch(key) {
		case 'id':
			return 'ID';
		case 'se':
			return 'S/E';
		case 'orderId':
			return 'ID';
		case 'timestamp':
			return 'Time';
		case 'isLong':
			return 'Side';
		case 'market':
			return 'Market';
		case 'orderType':
			return 'Type';
		case 'upl':
			return 'P/L';
		case 'pnl':
			return 'P/L';
		case 'isReduceOnly':
			return 'Reduce-Only';
		case 'cancelOrderId':
			return 'OCO';
		case 'liqprice':
			return 'Liq. Price';
		default:
			return key;
	}
}

export function formatMarketName(name, graySecondary) {
	if (!name) return;
	name = name.replace('-', '/');
	if (graySecondary) {
		name = name.replace('/USD', `<span class='grayed'>/USD</span>`).replace('USD/', `<span class='grayed'>USD/</span>`);
	}
	return name;
}

export function formatDate(timestamp) {
	if (!timestamp || timestamp * 1 == 0) return;
	// timestamp in seconds
	return new Date(timestamp*1000).toLocaleString(get(locale));
}

export function letterify(amount) {
	if (amount >= 10**9) return Math.round(amount/10**9) + 'B';
	if (amount >= 10**6) return Math.round(amount/10**6) + 'M';
	if (amount >= 10**3) return Math.round(amount/10**3) + 'K';
}

export function formatForDisplay(amount, fix) {

	amount = amount * 1;

	if (!amount || isNaN(amount)) return 0;

	if (!fix && (amount * 1).toFixed(6)*1 == Math.round(amount * 1)) return Math.round(amount);
	
	if (fix) return (amount*1).toFixed(fix);

	if (amount * 1 >= 10000 || amount * 1 <= -10000) {
		return Math.round(amount*1);
	} else if (amount * 1 >= 10 || amount * 1 <= -10) {
		return (amount * 1).toFixed(2);
	} else if (amount * 1 >= 1 || amount * 1 <= -1) {
		return +(amount * 1).toFixed(4);
	} else if (amount * 1 >= 0.01 || amount * 1 <= -0.01) {
		return +(amount * 1).toFixed(5);
	} else {
		return +(amount * 1).toFixed(6);
	}

}

export function numberWithCommas(amount) {   // Get Commafied Value 
	let formattedAmount = formatForDisplay(amount) * 1;
	return formattedAmount.toLocaleString(get(locale));
}

export function formatCAPForDisplay(amountStr) {
	const amount = amountStr * 1;
	const digits = MAX_CAP_DISPLAY_DECIMALS;
	const minIncrement = 10**-digits;
	if (!amount) return 0;
	if (amount <= minIncrement) return minIncrement;
	return Math.ceil(amount * 10**digits) / 10**digits;
}

export function formatOrderType(orderType) {
	if (!orderType) return 'Market';
	if (orderType == 1) return 'Limit';
	if (orderType == 2) return 'Stop';
}

export function formatSide(isLong, isReduceOnly, pnl) {
	if (isReduceOnly && isLong || isLong && pnl) {
		return 'Close Short';
	} else if (isReduceOnly && !isLong || !isLong && pnl) {
		return 'Close Long';
	} else if (isLong) {
		return 'Long';
	} else {
		return 'Short';
	}
}

export function formatPnl(pnl, isPercent) {
	let string = '';
	if (pnl == undefined) return string;
	if (pnl > 0) {
		string += '+';
	} else if (pnl > 0) {
		string += '-';
	}
	string += formatForDisplay(pnl, isPercent ? 2 : null) || 0;
	if (isPercent) string += '%';
	return string;
}

export function formatMarket(market) {

	if (!market) return;

	return {
		'Name': market.name,
		'Category': market.category,
		'Chainlink Execution Allowed': market.allowChainlinkExecution ? 'Yes' : 'No',
		'Fee': `${formatForDisplay(100 * market.fee / BPS_DIVIDER)}%`,
		'Is Closed': market.isClosed ? 'Yes' : 'No',
		'Liquidation Threshold': `${formatForDisplay(100 * market.liqThreshold / BPS_DIVIDER)}%`,
		'Max Deviation vs Chainlink': `${formatForDisplay(100 * market.maxDeviation / BPS_DIVIDER)}%`,
		'Max Leverage': market.maxLeverage,
		'Only Reduce-Only Allowed': market.isReduceOnly ? 'Yes' : 'No'
	}

}

export function formatGraphCandle(candle) {

	if (!candle) return;

	return [
		candle.timestamp,
		formatUnits(candle.l) * 1,
		formatUnits(candle.h) * 1,
		formatUnits(candle.o) * 1,
		formatUnits(candle.c) * 1
	];

}

export function formatPoolStat(stat) {
	if (!stat) return;
	const asset = getLabelForAsset(stat.asset);
	return {
		startingBalance: stat.startingBalance,
		balance: stat.balance,
		deposits: stat.deposits,
		withdrawals: stat.withdrawals,
		asset: stat.asset,
		assetLabel: asset,
		timestamp: stat.timestamp,
		period: stat.period
	};
}

export function formatFeeStat(stat) {

	if (!stat) return;

	const asset = getLabelForAsset(stat.asset);
	let units = 18;
	if (asset == 'USDC') {
		units = 6;
	}

	return {
		id: stat.id,
		asset: stat.asset,
		assetLabel: asset,
		timestamp: stat.timestamp,
		period: stat.period,
		market: stat.market,

		total: 1*formatUnits(stat.total, units),
		totalUsd: 1*formatUnits(stat.totalUsd, units),
		rebates: 1*formatUnits(stat.rebates, units),
		rebatesUsd: 1*formatUnits(stat.rebatesUsd, units),
		toPool: 1*formatUnits(stat.toPool, units),
		toPoolUsd: 1*formatUnits(stat.toPoolUsd, units),
		toStakers: 1*formatUnits(stat.toStakers, units),
		toStakersUsd: 1*formatUnits(stat.toStakersUsd, units)
	};

}

export function formatOrder(order) {
	if (!order) return;
	order = Object.assign({}, order);
	const asset = getLabelForAsset(order.asset);
	let units = asset == 'USDC' ? 6 : 18;
	order.assetAddress = order.asset;
	order.asset = asset;
	order.margin = formatUnits(order.margin, units);
	order.size = formatUnits(order.size, units);
	order.price = formatUnits(order.price);
	order.fee = formatUnits(order.fee, units);
	order.leverage = order.margin * 1 > 0 ? Math.ceil(order.size * 1000 / order.margin)/1000 * 1 : 0;
	return order;
}

export function formatPosition(position, preProcessing) {
	if (!position) return;
	position = Object.assign({}, position);
	const asset = getLabelForAsset(position.asset);
	let units = asset == 'USDC' ? 6 : 18;
	position.assetAddress = position.asset;
	position.asset = asset;
	position.margin = formatUnits(position.margin, units);
	position.size = formatUnits(position.size, units);
	position.price = formatUnits(position.price);

	if (preProcessing)
	{
	position.leverage = Math.ceil(position.size * 1000 / position.margin)/1000;
	}
	
	return position;
}

export function formatHistoryItem(item) {
	if (!item) return;
	item = Object.assign({}, item);
	const asset = getLabelForAsset(item.asset);
	let units = asset == 'USDC' ? 6 : 18;
	item.asset = asset;
	item.leverage = item.margin * 1 > 0 ? item.size * 1 / item.margin : 0;
	return item;
}
