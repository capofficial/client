import { get } from 'svelte/store'
import { ethers } from 'ethers'
import { Alchemy } from 'alchemy-sdk'
import { CURRENCY_DECIMALS, BPS_DIVIDER, ALCHEMY_SETTINGS } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { address, poolBalances, bufferBalances, poolStakes, poolStatsDaily, poolStatsWeekly, poolWithdrawalFees, poolDepositTaxes, poolWithdrawalTaxes, globalUPLs, poolTransactions, lastPoolTransactionsCount } from '@lib/stores'
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

let isLoadingPoolTransactions = false;

export async function getPoolTransactions(params) {
	if (isLoadingPoolTransactions) return false;
	isLoadingPoolTransactions = true;

	try {
		const alchemy = new Alchemy({network: 'arb-mainnet', apiKey: ALCHEMY_SETTINGS.apiKey});
		const poolContract = await getContract('Pool', false, true);

		if (!poolContract) {
			isLoadingPoolTransactions = false;
			return false;
		}

		if (!params) params = {};
		let { first, skip } = params;
		if (!first) first = 50;
		if (!skip) skip = 0;

		const currentTransactions = get(poolTransactions);

		// Get Pool events
		const fromBlock = skip === 0 ? undefined : await getStartBlock(poolContract, skip);

		const eventFilters = [
			{
				address: poolContract,
				topics: [ethers.utils.id('PoolDeposit(address,address,uint256,uint256,uint256)')]
			},
			{
				address: poolContract,
				topics: [ethers.utils.id('PoolWithdrawal(address,address,uint256,uint256,uint256)')]
			},
			{
				address: poolContract,
				topics: [ethers.utils.id('PoolPayIn(address,address,string,uint256,uint256,uint256,uint256)')]
			},
			{
				address: poolContract,
				topics: [ethers.utils.id('PoolPayOut(address,address,string,uint256,uint256,uint256)')]
			}
		];

		let allLogs = [];
		for (const filter of eventFilters) {
			const logs = await alchemy.core.getLogs({
				...filter,
				fromBlock: fromBlock || '0x0',
				toBlock: 'latest'
			});
			allLogs = allLogs.concat(logs);
		}

		// Sort by block number and transaction index descending
		allLogs.sort((a, b) => {
			if (b.blockNumber !== a.blockNumber) {
				return b.blockNumber - a.blockNumber;
			}
			return b.transactionIndex - a.transactionIndex;
		});

		// Paginate
		const paginatedLogs = allLogs.slice(skip, skip + first);

		// Format logs
		const transactions = await formatPoolLogs(paginatedLogs);

		lastPoolTransactionsCount.set(transactions.length);

		if (skip > 0) {
			poolTransactions.set([...currentTransactions, ...transactions]);
		} else {
			poolTransactions.set(transactions);
		}

		isLoadingPoolTransactions = false;
		return true;
	} catch(e) {
		console.error('getPoolTransactions error', e);
		isLoadingPoolTransactions = false;
		return false;
	}
}

async function getStartBlock(contract, skip) {
	return undefined;
}

async function formatPoolLogs(logs) {
	const iface = new ethers.utils.Interface([
		'event PoolDeposit(address indexed user, address indexed asset, uint256 amount, uint256 clpAmount, uint256 poolBalance)',
		'event PoolWithdrawal(address indexed user, address indexed asset, uint256 amount, uint256 clpAmount, uint256 poolBalance)',
		'event PoolPayIn(address indexed user, address indexed asset, string market, uint256 amount, uint256 bufferToPoolAmount, uint256 poolBalance, uint256 bufferBalance)',
		'event PoolPayOut(address indexed user, address indexed asset, string market, uint256 amount, uint256 poolBalance, uint256 bufferBalance)'
	]);

	const formatted = [];
	for (const log of logs) {
		try {
			const parsed = iface.parseLog(log);
			if (!parsed) continue;

			let transaction = {
				type: '',
				user: parsed.args.user,
				asset: getLabelForAsset(parsed.args.asset),
				amount: formatUnits(parsed.args.amount || 0, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18),
				blockNumber: log.blockNumber,
				transactionHash: log.transactionHash,
				timestamp: 0
			};

			const block = await getBlockTimestamp(log.blockNumber);
			transaction.timestamp = block;

			switch (parsed.name) {
				case 'PoolDeposit':
					transaction.type = 'Deposit';
					transaction.clpAmount = formatUnits(parsed.args.clpAmount, 18);
					transaction.poolBalance = formatUnits(parsed.args.poolBalance, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					break;
				case 'PoolWithdrawal':
					transaction.type = 'Withdrawal';
					transaction.clpAmount = formatUnits(parsed.args.clpAmount, 18);
					transaction.poolBalance = formatUnits(parsed.args.poolBalance, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					break;
				case 'PoolPayIn':
					transaction.type = 'Pay In';
					transaction.market = parsed.args.market;
					transaction.bufferToPoolAmount = formatUnits(parsed.args.bufferToPoolAmount, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					transaction.poolBalance = formatUnits(parsed.args.poolBalance, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					transaction.bufferBalance = formatUnits(parsed.args.bufferBalance, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					break;
				case 'PoolPayOut':
					transaction.type = 'Pay Out';
					transaction.market = parsed.args.market;
					transaction.poolBalance = formatUnits(parsed.args.poolBalance, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					transaction.bufferBalance = formatUnits(parsed.args.bufferBalance, CURRENCY_DECIMALS[getLabelForAsset(parsed.args.asset)] || 18);
					break;
			}

			formatted.push(transaction);
		} catch(e) {
			console.error('Error parsing log', e);
		}
	}
	return formatted;
}

const blockTimestampCache = {};
async function getBlockTimestamp(blockNumber) {
	if (blockTimestampCache[blockNumber]) return blockTimestampCache[blockNumber];
	try {
		const alchemy = new Alchemy({network: 'arb-mainnet', apiKey: ALCHEMY_SETTINGS.apiKey});
		const block = await alchemy.core.getBlock(blockNumber);
		const timestamp = block.timestamp;
		blockTimestampCache[blockNumber] = timestamp;
		return timestamp;
	} catch(e) {
		return 0;
	}
}
