import { get } from 'svelte/store'
import { CURRENCY_DECIMALS, BPS_DIVIDER } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { address, poolBalances, bufferBalances, poolStakes, poolStatsDaily, poolStatsWeekly, poolWithdrawalFees, poolDepositTaxes, poolWithdrawalTaxes, globalUPLs } from '@lib/stores'
import { getAssetAddress, getAssetAddresses, getLabelForAsset, getChainData } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

const POOL_HISTORY_EVENTS = ['PoolDeposit', 'PoolWithdrawal', 'PoolPayIn', 'PoolPayOut'];
const POOL_HISTORY_BLOCK_SPAN = 10000;
const POOL_HISTORY_PAGE_SIZE = 50;
const blockTimestampCache = new Map();

function getPoolTransactionType(eventName) {
	return {
		PoolDeposit: 'deposit',
		PoolWithdrawal: 'withdrawal',
		PoolPayIn: 'pay in',
		PoolPayOut: 'pay out'
	}[eventName];
}

function isBeforeCursor(item, cursor) {
	if (!cursor) return true;
	if (item.blockNumber < cursor.blockNumber) return true;
	return item.blockNumber == cursor.blockNumber && item.logIndex < cursor.logIndex;
}

function formatPoolTransaction(log, parsedLog) {
	const args = parsedLog.args;
	const asset = getLabelForAsset(args.asset) || args.asset;
	const decimals = CURRENCY_DECIMALS[asset] || 18;
	const explorer = getChainData('explorer');
	const logIndex = log.logIndex == undefined ? 0 : log.logIndex;

	const transaction = {
		id: `${log.transactionHash}:${logIndex}`,
		type: getPoolTransactionType(parsedLog.name),
		user: args.user,
		asset,
		market: args.market || '',
		amount: formatUnits(args.amount, decimals),
		poolBalance: formatUnits(args.poolBalance, decimals),
		blockNumber: log.blockNumber,
		logIndex,
		timestamp: 0,
		transactionHash: log.transactionHash,
		explorerUrl: explorer ? `${explorer}/tx/${log.transactionHash}` : ''
	};

	if (args.bufferBalance != undefined) {
		transaction.bufferBalance = formatUnits(args.bufferBalance, decimals);
	}

	return transaction;
}

async function getBlockTimestamp(provider, blockNumber) {
	if (blockTimestampCache.has(blockNumber)) return blockTimestampCache.get(blockNumber);
	try {
		const block = await provider.getBlock(blockNumber);
		const timestamp = block && block.timestamp ? block.timestamp : 0;
		blockTimestampCache.set(blockNumber, timestamp);
		return timestamp;
	} catch (e) {
		blockTimestampCache.set(blockNumber, 0);
		return 0;
	}
}

export async function getPoolTransactions(params = {}) {
	const contract = await getContract('Pool');
	if (!contract || !contract.provider || !contract.address) {
		return {items: [], nextCursor: null, hasMore: false};
	}

	const pageSize = Math.max(1, Math.min(Number(params.pageSize) || POOL_HISTORY_PAGE_SIZE, 100));
	const provider = contract.provider;
	const latestBlock = await provider.getBlockNumber();
	const suppliedCursor = params.cursor;
	let cursor = suppliedCursor && Number.isInteger(Number(suppliedCursor.blockNumber))
		? {blockNumber: Number(suppliedCursor.blockNumber), logIndex: Number(suppliedCursor.logIndex) || 0}
		: null;
	let toBlock = cursor ? Math.min(cursor.blockNumber, latestBlock) : latestBlock;
	let reachedStart = false;
	let transactions = [];
	const eventTopics = POOL_HISTORY_EVENTS.map((eventName) => contract.interface.getEventTopic(eventName));

	while (transactions.length < pageSize && toBlock >= 0) {
		const fromBlock = Math.max(0, toBlock - POOL_HISTORY_BLOCK_SPAN + 1);
		const logs = await provider.getLogs({
			address: contract.address,
			fromBlock,
			toBlock,
			topics: [eventTopics]
		});

		for (const log of logs) {
			try {
				const parsedLog = contract.interface.parseLog(log);
				if (!parsedLog || !getPoolTransactionType(parsedLog.name)) continue;
				const transaction = formatPoolTransaction(log, parsedLog);
				if (isBeforeCursor(transaction, cursor)) transactions.push(transaction);
			} catch (e) {
				// Ignore logs that cannot be decoded by this contract ABI.
			}
		}

		if (fromBlock == 0) {
			reachedStart = true;
			break;
		}

		toBlock = fromBlock - 1;
		// The cursor only applies to the first block range. Older ranges are unfiltered.
		cursor = null;
	}

	transactions.sort((a, b) => {
		if (a.blockNumber != b.blockNumber) return b.blockNumber - a.blockNumber;
		return b.logIndex - a.logIndex;
	});

	const items = transactions.slice(0, pageSize);
	const blockNumbers = [...new Set(items.map((item) => item.blockNumber))];
	const timestamps = await Promise.all(blockNumbers.map(async (blockNumber) => {
		return [blockNumber, await getBlockTimestamp(provider, blockNumber)];
	}));
	const timestampByBlock = new Map(timestamps);
	for (const item of items) item.timestamp = timestampByBlock.get(item.blockNumber) || 0;

	const lastItem = items[items.length - 1];
	const hasMore = !reachedStart || transactions.length > pageSize;
	return {
		items,
		nextCursor: hasMore && lastItem ? {blockNumber: lastItem.blockNumber, logIndex: lastItem.logIndex} : null,
		hasMore
	};
}

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
