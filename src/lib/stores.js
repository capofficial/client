import { ethers } from 'ethers'
import { writable, derived } from 'svelte/store'

import { DEFAULT_LOCALE, DEFAULT_MARKET, DEFAULT_CURRENCY, DEFAULT_LEVERAGE, BPS_DIVIDER, DEFAULT_MARKETS_SORT_KEY, DEFAULT_ORDERS_SORT_KEY, DEFAULT_POSITIONS_SORT_KEY, DEFAULT_HISTORY_SORT_KEY } from './config'
import { formatPoolStat } from './formatters'
import { getUserSetting, calculateLiquidationPrice, getMargin } from './utils'

// Language
export const locale = writable(getUserSetting('locale') || DEFAULT_LOCALE);

// Router
export const component = writable();
export const pageName = writable();

// Modal
export const activeModal = writable();

// Error
export const activeError = writable();

// Settings
export const showOrdersOnChart = writable(getUserSetting('showOrdersOnChart') == undefined ? false : getUserSetting('showOrdersOnChart'));
export const showPositionsOnChart = writable(getUserSetting('showPositionsOnChart') == undefined ? false : getUserSetting('showPositionsOnChart'));
export const showTooltips = writable(getUserSetting('showTooltips') == undefined ? true : getUserSetting('showTooltips'));

// Contracts
export const provider = writable();
export const chainId = writable();
export const signer = writable();
export const address = writable();
export const unsupportedNetwork = writable();

// Refer
export const referralCode = writable();

// Chart
export const chartHeight = writable(getUserSetting('chartHeight') || 320);
export const chartResolution = writable(getUserSetting('chartResolution') || 900)
export const chartLoading = writable(false);
export const hoveredOHLC = writable();
export const accountHeight = writable(getUserSetting('accountHeight') || 250);

// Prices
export const prices = writable({}); // latest price for all markets
export const priceTimestamps = writable({}); // latest price timestamps
export const ohlc = writable({}); // 24h ohlc for markets
export const chainlinkPrice = writable(); // for current market
export const chainlinkAssetPrices = writable({}); // for assets
export const CAPPrice = writable();

// Pool
export const poolBalances = writable({});
export const poolStakes = writable({});
export const poolWithdrawalFees = writable({});
export const claimableRewardsCAP = writable({});
export const totalSupplyCAP = writable(0);
export const CAPStake = writable(0);

// Pool performance stats (including fees)
function getPoolPerformance(stats, latestIndex, oldestIndex) {
	if (!stats) return;
	let perf = {};
	for (const assetLabel in stats) {
		let data = stats[assetLabel]; // array
		if (!data.length) continue;
		if (oldestIndex >= data.length) {
			oldestIndex = data.length - 1;
		}
		let oldestStat = formatPoolStat(data[oldestIndex]);
		// startingBalance allows you to calculate performance
		let startingBalance = oldestStat.startingBalance;
		let latestStat = formatPoolStat(data[latestIndex]);
		let totalDeposits = data.reduce((sum, item) => sum + (item.deposits || 0), 0);
		let totalWithdrawals = data.reduce((sum, item) => sum + (item.withdrawals || 0), 0);
		perf[assetLabel] = latestStat.balance == 0 ? 0 : (latestStat.balance - startingBalance - (totalDeposits || 0) + (totalWithdrawals || 0)) / latestStat.balance;
	}
	return perf;
}
export const poolStatsDaily = writable({}); // asset => [stats]
export const poolStatsWeekly = writable({}); // asset => [stats]
export const weeklyPerformance = derived([poolStatsDaily], ([$poolStatsDaily]) => {
	return getPoolPerformance($poolStatsDaily, 0, 6);
}, {}); // asset => %
export const monthlyPerformance = derived([poolStatsDaily], ([$poolStatsDaily]) => {
	return getPoolPerformance($poolStatsDaily, 0, 29);
}, {}); // asset => %
export const yearlyPerformance = derived([poolStatsWeekly], ([$poolStatsWeekly]) => {
	return getPoolPerformance($poolStatsWeekly, 0, 51);
}, {}); // asset => %

// Rebates
export const trailing30dayVolume = writable();
export const currentFeeRebate = writable();
export const feeRebateFromVolume = writable();
export const feeRebateFromStaking = writable();
export const feeRebateFromReferral = writable(0);
export const totalFeesSaved = writable({});
export const rebateParams = writable([]);

// Funding rates
export const fundingTrackers = writable({});
export const fundingRate = writable(); // for selected asset
export const fundingRate24h = writable(); //for selected asset

// Toasts
export const toasts = writable([]);

function sorter(_array, _sortKey) {
	if (!_sortKey || !_sortKey[0]) return _array; // default sorting
	const key = _sortKey[0];
	let __array = [..._array];
	__array.sort((a, b) => {
		let lt = a[key] < b[key];
		let gt = a[key] > b[key];
		if (ethers.BigNumber.isBigNumber(a[key])) {
			lt = a[key].lt(b[key]);
			gt = a[key].gt(b[key]);
		}
		if (_sortKey[1]) {
			// sort desc
			if (lt) {
				return 1;
			} else if (gt) {
				return -1;
			}
			return 0;
		} else {
			// sort asc
			if (lt) {
				return -1;
			} else if (gt) {
				return 1;
			}
			return 0;
		}
	});
	return __array;
}

// Orders
export const orders = writable([]);
export const ordersColumnsToShow = writable(getUserSetting('ordersColumnsToShow') || ['timestamp', 'isLong', 'market', 'price', 'size', 'margin', 'orderType', 'isReduceOnly', 'tools']);
export const ordersSortKey = writable(getUserSetting('ordersSortKey') || DEFAULT_ORDERS_SORT_KEY); // [columnName, isDesc]
export const ordersSorted = derived([orders, ordersSortKey], ([$orders, $ordersSortKey]) => {
	return sorter($orders, $ordersSortKey);
}, []);

// Positions
export const positions = writable([]);
export const positionsColumnsToShow = writable(getUserSetting('positionsColumnsToShow') || ['timestamp', 'isLong', 'market', 'price', 'size', 'margin', 'upl', 'funding', 'liqprice', 'tools']);
export const positionsSortKey = writable(getUserSetting('positionsSortKey') || DEFAULT_POSITIONS_SORT_KEY); // [columnName, isDesc]
export const positionsSorted = derived([positions, positionsSortKey], ([$positions, $positionsSortKey]) => {
	return sorter($positions, $positionsSortKey);
}, []);

// History
export const history = writable([]);
export const historyColumnsToShow = writable(getUserSetting('historyColumnsToShow') || ['timestamp', 'isLong', 'market', 'price', 'size', 'status', 'reason', 'pnl']);
export const historySortKey = writable(['timestamp', true]); // [columnName, isDesc]
export const historySorted = derived([history, historySortKey], ([$history, $historySortKey]) => {
	return sorter($history, $historySortKey);
}, []);
export const lastHistoryItemsCount = writable(0); // how many items were fetched on the last history page requested (used for infinite scroll)
export const historyOrderStatusToShow = writable(getUserSetting('historyOrderStatusToShow') || ['cancelled', 'executed', 'liquidated'])

// Markets
export const marketSearchQuery = writable();
export const marketInfos = writable({});
export const marketList = writable([]);
export const selectedMarket = writable(getUserSetting('selectedMarket') || DEFAULT_MARKET);
export const showMarketList = writable(false);
export const riskParams = writable([]);
export const oi = writable(0); // for selected market and asset
export const selectedMarketInfo = derived([marketInfos, selectedMarket], ([$marketInfos, $selectedMarket]) => {
	return $marketInfos[$selectedMarket] || {};
}, {});
export const lastDayChange = derived([prices, ohlc, selectedMarket], ([$prices, $ohlc, $selectedMarket]) => {
	const _price = $prices[$selectedMarket];
	const _ohlc = $ohlc[$selectedMarket];
	if (!_price || !_ohlc) return {};
	const priceChange = _price * 1 - _ohlc.o * 1;
	return {
		price: priceChange,
		percent: 100 * priceChange / _price
	};
}, {price: 0, percent: 0});

export const marketsFilter = writable('open');
export const marketsSortKey = writable(getUserSetting('marketsSortKey') || DEFAULT_MARKETS_SORT_KEY); // [columnName, isDesc]
export const starredMarkets = writable(getUserSetting('starredMarkets') || {});
export const marketsSorted = derived([marketInfos, marketSearchQuery, marketsSortKey, prices, ohlc, marketsFilter, starredMarkets], ([$marketInfos, $marketSearchQuery, $marketsSortKey, $prices, $ohlc, $marketsFilter, $starredMarkets]) => {
	let marketList = [];

	if ($marketsFilter == 'starred') {
		for (const market in $starredMarkets) {
			const price = $prices[market];
			const change = !price || !$ohlc[market] ? 0 : 100 * (price * 1 - $ohlc[market].o * 1) / price;
			marketList.push({
				market,
				price,
				change
			});
		}
	} else {

		for (const market in $marketInfos) {
			const category = $marketInfos[market].category;
			const name = $marketInfos[market].name;
			let q = $marketSearchQuery?.toLowerCase();

			let includeMarket = !q && ($marketsFilter == 'all' || $marketsFilter == 'open') || market.toLowerCase().includes(q) || category.toLowerCase().includes(q) || name.toLowerCase().includes(q)
				|| category.toLowerCase() == $marketsFilter || $marketsFilter == 'hot';

			if ($marketsFilter == 'open') {
				includeMarket = !$marketInfos[market].isClosed;
			}
			
			if (includeMarket) {
				const price = $prices[market];
				const change = !price || !$ohlc[market] ? 0 : 100 * (price * 1 - $ohlc[market].o * 1) / price;
				marketList.push({
					market,
					price,
					change
				});
			}

		}

		if ($marketsFilter == 'hot') {

			marketList = marketList.filter((item) => !$marketInfos[item.market].isClosed);

			// Only keep top 5 gainers and losers
			const marketsSortedByChange = marketList.sort((a,b) => {
				if (a.change < b.change) return -1;
				if (a.change > b.change) return 1;
				return 0;
			});

			if (marketsSortedByChange.length < 10) {
				marketList = marketsSortedByChange;
			} else {
				const gainers = marketsSortedByChange.slice(0, 5);
				const losers = marketsSortedByChange.slice(-5);
				marketList = gainers.concat(losers);
			}
		}

	}

	return sorter(marketList, $marketsSortKey);
}, []);


// Wallet
export const balances = writable({});
export const allowances = writable({});
export const selectedAsset = writable(getUserSetting('selectedAsset') || DEFAULT_CURRENCY);

// New Order
export const isLong = writable(true);
export const orderType = writable(0);
export const size = writable();
export const price = writable();
export const tpPrice = writable();
export const slPrice = writable();
export const hasTPSL = writable(false);
export const leverage = writable(DEFAULT_LEVERAGE);
export const priceAsset = writable('USD');
export const isReduceOnly = writable(false);
export const isProtectedOrder = writable(false);
export const tpPriceInPercent = writable(false);
export const slPriceInPercent = writable(false);
export const showLeverageSlider = writable(false);
export const submittingOrder = writable(false);

export const buyingPower = derived([balances, leverage, selectedAsset], ([$balances, $leverage, $selectedAsset]) => {
	if (!$selectedAsset || !$balances[$selectedAsset] || !$leverage) return 0;
	return $balances[$selectedAsset] * $leverage;
}, 0);

export const maxSize = derived([balances, leverage, currentFeeRebate, selectedMarketInfo, selectedAsset], ([$balances, $leverage, $currentFeeRebate, $selectedMarketInfo, $selectedAsset]) => {
	if (!$balances[$selectedAsset] || !$selectedMarketInfo) return 0;
	if (!$currentFeeRebate) $currentFeeRebate = 0;

	// console.log('maxSize recalc', $balances[$selectedAsset], $leverage, $currentFeeRebate, $selectedMarketInfo, $selectedAsset);
	// console.log('$leverage', $leverage);
	
	let gasFee = 0;
	if ($selectedAsset == 'ETH') gasFee = 0.002;

	if (!$selectedMarketInfo.fee) return $balances[$selectedAsset] * $leverage * 1 - gasFee;

	const balanceAfterFees = $balances[$selectedAsset] * (1 - $leverage * $selectedMarketInfo.fee / BPS_DIVIDER) - gasFee;

	if (balanceAfterFees < 0) return 0;

	return balanceAfterFees * $leverage * 1;

}, 0);

export const margin = derived([size, leverage], ([$size, $leverage]) => {
	if (!$size || !$leverage) return 0;
	const margin = getMargin($size, $leverage)
	return margin;
}, 0);
export const sizeInUsd = derived([size, selectedAsset, prices], ([$size, $selectedAsset, $prices]) => {
	if (!$prices || !$selectedAsset || !$size) return 0;
	if ($selectedAsset == 'USDC') return $size;
	if ($selectedAsset == 'WBTC') {
		$selectedAsset = 'BTC';
	}
	return $prices[`${$selectedAsset}-USD`] * $size;
}, 0);
export const liquidationPrice = derived([prices, price, chainlinkPrice, leverage, isLong, selectedMarket, selectedMarketInfo, orderType], ([$prices, $price, $chainlinkPrice, $leverage, $isLong, $selectedMarket, $selectedMarketInfo, $orderType]) => {
	if (!$prices || !$leverage || !$selectedMarket || !$selectedMarketInfo) return 0;
	let _price;
	if ($orderType == 0) {
		_price = $chainlinkPrice || $prices[$selectedMarket];
	} else {
		_price = $price;
	}
	if (!_price) return 0;
	return calculateLiquidationPrice({
		liqThreshold: $selectedMarketInfo.liqThreshold,
		price: _price,
		leverage: $leverage,
		isLong: $isLong
	});
}, 0);
