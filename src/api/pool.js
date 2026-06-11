import { get } from 'svelte/store'
import { CURRENCY_DECIMALS, BPS_DIVIDER } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { address, poolBalances, bufferBalances, poolStakes, poolStatsDaily, poolStatsWeekly, poolWithdrawalFees, poolDepositTaxes, poolWithdrawalTaxes, globalUPLs } from '@lib/stores'
import { getAssetAddress, getAssetAddresses, getLabelForAsset, getChainData } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

const POOL_TRANSACTION_EVENTS = [
	'PoolDeposit',
	'PoolWithdrawal',
	'PoolPayIn',
	'PoolPayOut'
];

function getPoolTransactionType(eventName) {
	switch(eventName) {
		case 'PoolDeposit':
			return 'Deposit';
		case 'PoolWithdrawal':
			return 'Withdrawal';
		case 'PoolPayIn':
			return 'Pay In';
		case 'PoolPayOut':
			return 'Pay Out';
		default:
			return eventName;
	}
}

function formatPoolEventAmount(amount, asset) {
	const decimals = CURRENCY_DECIMALS[asset] || 18;
	return formatUnits(amount, decimals);
}

function formatPoolTransaction(log) {
	if (!log || !log.args) return;

	const asset = getLabelForAsset(log.args.asset) || '';

	return {
		id: `${log.transactionHash}-${log.logIndex}`,
		type: getPoolTransactionType(log.event),
		asset,
		amount: formatPoolEventAmount(log.args.amount, asset),
		market: log.args.market || '',
		user: log.args.user,
		poolBalance: log.args.poolBalance ? formatPoolEventAmount(log.args.poolBalance, asset) : undefined,
		blockNumber: log.blockNumber,
		logIndex: log.logIndex,
		transactionHash: log.transactionHash
	};
}

export async function getPoolTransactions(options = {}) {
	const contract = await getContract('Pool');
	if (!contract || !contract.provider) {
		return {
			items: [],
			nextBeforeBlock: null
		};
	}

	const pageSize = options.pageSize || 20;
	const blockSpan = options.blockSpan || 10000;
	const maxWindows = options.maxWindows || 6;
	const latestBlock = await contract.provider.getBlockNumber();
	let toBlock = options.beforeBlock == null ? latestBlock : options.beforeBlock;
	let nextBeforeBlock = toBlock;
	let items = [];
	let windowsScanned = 0;

	while (items.length < pageSize && nextBeforeBlock !== null && windowsScanned < maxWindows) {
		toBlock = nextBeforeBlock;
		const fromBlock = Math.max(0, toBlock - blockSpan + 1);
		const eventLogs = await Promise.all(POOL_TRANSACTION_EVENTS.map((eventName) => {
			return contract.queryFilter(contract.filters[eventName](), fromBlock, toBlock);
		}));

		items = items.concat(eventLogs.flat().map(formatPoolTransaction).filter(Boolean));
		nextBeforeBlock = fromBlock > 0 ? fromBlock - 1 : null;
		windowsScanned++;
	}

	items = items.sort((a, b) => {
		if (a.blockNumber == b.blockNumber) return b.logIndex - a.logIndex;
		return b.blockNumber - a.blockNumber;
	});

	return {
		items,
		nextBeforeBlock
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
