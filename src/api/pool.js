import { ethers } from 'ethers'
import { get } from 'svelte/store'
import { CURRENCY_DECIMALS, BPS_DIVIDER, POOL_TRANSACTIONS_BLOCK_RANGE, POOL_TRANSACTIONS_MAX_RANGES } from '@lib/config'
import { ABIS } from '@lib/abis'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { provider } from '@lib/stores'
import { address, poolBalances, bufferBalances, poolStakes, poolStatsDaily, poolStatsWeekly, poolWithdrawalFees, poolDepositTaxes, poolWithdrawalTaxes, globalUPLs } from '@lib/stores'
import { getAssetAddress, getAssetAddresses, getLabelForAsset, getChainData } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

export async function getPoolBalances() {
	const contract = await getContract('PoolStore');
	const assetAddresses = getAssetAddresses();
	const balances = await contract.getBalances(assetAddresses);
	let _poolBalances = {};
	let i = 0;
	for (const bal of balances) {
		const asset = getLabelForAsset(assetAddresses[i]);
		_poolBalances[asset] = formatUnits(balances[i], CURRENCY_DECIMALS[asset]);
		i++;
	}
	poolBalances.set(_poolBalances);
	return true;
}

// In new contracts only
export async function getBufferBalances() {
	const contract = await getContract('PoolStore');
	const assetAddresses = getAssetAddresses();
	const balances = await contract.getBufferBalances(assetAddresses);
	let _bufferBalances = {};
	let i = 0;
	for (const bal of balances) {
		const asset = getLabelForAsset(assetAddresses[i]);
		_bufferBalances[asset] = formatUnits(balances[i], CURRENCY_DECIMALS[asset]);
		i++;
	}
	bufferBalances.set(_bufferBalances);
	return true;
}

export async function getGlobalUPL(asset) {
	const contract = await getContract('Pool');
	const assetAddress = getAssetAddress(asset);
	const upl = await contract.getGlobalUPL(assetAddress);
	globalUPLs.update((gupl) => {
		gupl[asset] = formatUnits(upl, CURRENCY_DECIMALS[asset]);
		return gupl;
	});
	return true;
}

export async function getPoolDepositTaxBps(asset, _amount) {
	const contract = await getContract('Pool');
	const assetAddress = getAssetAddress(asset);
	if (!_amount) return 0;
	const amount = parseUnits(_amount, CURRENCY_DECIMALS[asset]);
	const taxBps = await contract.getDepositTaxBps(assetAddress, amount);
	return Math.round(taxBps) / 100;
}

export async function getPoolWithdrawalTaxBps(asset, _amount) {
	const contract = await getContract('Pool');
	const assetAddress = getAssetAddress(asset);
	if (!_amount) return 0;
	const amount = parseUnits(_amount, CURRENCY_DECIMALS[asset]);
	const taxBps = await contract.getWithdrawalTaxBps(assetAddress, amount);
	return Math.round(taxBps) / 100;
}

export async function getPoolWithdrawalFee(asset) {
	const contract = await getContract('PoolStore');
	const assetAddress = getAssetAddress(asset);
	const fee = await contract.getWithdrawalFee(assetAddress);
	poolWithdrawalFees.update((pwf) => {
		pwf[asset] = Math.round(fee * 100 / BPS_DIVIDER);
		return pwf;
	});
	return true;
}

export async function getUserPoolStakes() {
	if (!get(address)) return;
	const contract = await getContract('PoolStore');
	const assetAddresses = getAssetAddresses();
	const balances = await contract.getUserBalances(assetAddresses, get(address));
	let _poolStakes = {};
	let i = 0;
	for (const bal of balances) {
		const asset = getLabelForAsset(assetAddresses[i]);
		_poolStakes[asset] = formatUnits(balances[i], CURRENCY_DECIMALS[asset]);
		i++;
	}
	poolStakes.set(_poolStakes);
}

export async function deposit(_asset, _amount) {
	const contract = await getContract('Pool', true);
	const amount = parseUnits(_amount, CURRENCY_DECIMALS[_asset]);
	const asset = getAssetAddress(_asset);
	let value = '';
	if (_asset == 'ETH') value = amount;
	try {
		let tx = await contract.deposit(asset, amount, {value});
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Deposit succeeded.', 1);
			getPoolBalances();
			getUserPoolStakes();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}

export async function withdraw(_asset, _amount) {
	const contract = await getContract('Pool', true);
	const amount = parseUnits(_amount, CURRENCY_DECIMALS[_asset]);
	const asset = getAssetAddress(_asset);
	try {
		let tx = await contract.withdraw(asset, amount);
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Withdrawal succeeded.', 1);
			getPoolBalances();
			getUserPoolStakes();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}

function formatPoolTransactionAmount(assetAddress, amount) {
	const asset = getLabelForAsset(assetAddress);
	return formatUnits(amount, CURRENCY_DECIMALS[asset]);
}

function normalizePoolTransaction(event, timestamp) {
	const args = event.args;
	const base = {
		id: `${event.transactionHash}-${event.logIndex}`,
		type: event.event,
		user: args.user,
		asset: args.asset,
		assetLabel: getLabelForAsset(args.asset),
		amount: formatPoolTransactionAmount(args.asset, args.amount),
		poolBalance: formatPoolTransactionAmount(args.asset, args.poolBalance),
		market: args.market,
		timestamp,
		blockNumber: event.blockNumber,
		logIndex: event.logIndex,
		transactionHash: event.transactionHash
	};

	if (args.bufferBalance) base.bufferBalance = formatPoolTransactionAmount(args.asset, args.bufferBalance);
	if (args.bufferToPoolAmount) base.bufferToPoolAmount = formatPoolTransactionAmount(args.asset, args.bufferToPoolAmount);
	if (args.clpAmount) base.clpAmount = formatUnits(args.clpAmount);

	return base;
}

async function getBlockTimestamps(_provider, events) {
	const timestamps = {};
	const blockNumbers = [...new Set(events.map((event) => event.blockNumber))];
	await Promise.all(blockNumbers.map(async (blockNumber) => {
		const block = await _provider.getBlock(blockNumber);
		timestamps[blockNumber] = block?.timestamp;
	}));
	return timestamps;
}

function withTimeout(promise, timeout = 5000) {
	return Promise.race([
		promise,
		new Promise((resolve) => setTimeout(() => resolve([]), timeout))
	]);
}

async function queryPoolEvents(pool, filters, fromBlock, toBlock) {
	let events = [];
	for (const filter of filters) {
		try {
			events = events.concat(await withTimeout(pool.queryFilter(filter, fromBlock, toBlock)));
		} catch(e) {
			console.warn('Pool transaction event query failed', { fromBlock, toBlock, topic: filter.topics?.[0] }, e);
		}
	}
	return events;
}

async function getPoolContractForTransactions() {
	const currentProvider = get(provider);
	const rpc = getChainData('fallbackRpcs')?.[0];
	const dataStoreAddress = getChainData('dataStore');
	if (rpc && dataStoreAddress) {
		const fallbackProvider = new ethers.providers.JsonRpcProvider(rpc);
		const dataStore = new ethers.Contract(dataStoreAddress, ABIS.DataStore, fallbackProvider);
		const poolAddress = await dataStore.getAddress('Pool');
		return {
			pool: new ethers.Contract(poolAddress, ABIS.Pool, fallbackProvider),
			provider: fallbackProvider
		};
	}

	try {
		const pool = await getContract('Pool');
		if (pool) return { pool, provider: currentProvider };
	} catch(e) {
		console.warn('Default provider failed while loading pool transactions', e);
	}

	const defaultRpc = getChainData('rpc');
	if (!defaultRpc || !dataStoreAddress) return {};

	const fallbackProvider = new ethers.providers.JsonRpcProvider(defaultRpc);
	const dataStore = new ethers.Contract(dataStoreAddress, ABIS.DataStore, fallbackProvider);
	const poolAddress = await dataStore.getAddress('Pool');
	return {
		pool: new ethers.Contract(poolAddress, ABIS.Pool, fallbackProvider),
		provider: fallbackProvider
	};
}

export async function getPoolTransactionsPage(params = {}) {
	const { pool, provider: _provider } = await getPoolContractForTransactions();
	if (!_provider || !pool) {
		return {
			transactions: [],
			nextToBlock: params.toBlock,
			hasMore: false
		};
	}

	let toBlock = params.toBlock || await _provider.getBlockNumber();
	let transactions = [];
	let rangesChecked = 0;

	while (toBlock > 0 && transactions.length < (params.count || 1) && rangesChecked < POOL_TRANSACTIONS_MAX_RANGES) {
		const fromBlock = Math.max(0, toBlock - POOL_TRANSACTIONS_BLOCK_RANGE + 1);
		const filters = [
			pool.filters.PoolDeposit(),
			pool.filters.PoolWithdrawal(),
			pool.filters.PoolPayIn(),
			pool.filters.PoolPayOut()
		];

		const events = (await queryPoolEvents(pool, filters, fromBlock, toBlock)).sort((a, b) => {
			if (a.blockNumber == b.blockNumber) return b.logIndex - a.logIndex;
			return b.blockNumber - a.blockNumber;
		});
		const timestamps = await getBlockTimestamps(_provider, events);

		transactions = transactions.concat(events.map((event) => normalizePoolTransaction(event, timestamps[event.blockNumber])));
		toBlock = fromBlock - 1;
		rangesChecked++;
	}

	return {
		transactions,
		nextToBlock: toBlock,
		hasMore: toBlock > 0
	};
}
