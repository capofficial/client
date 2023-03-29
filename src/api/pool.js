import { get } from 'svelte/store'
import { CURRENCY_DECIMALS, BPS_DIVIDER } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
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

export async function getPoolDepositTaxBps(asset) {
	const contract = await getContract('Pool');
	const assetAddress = getAssetAddress(asset);
	const taxBps = await contract.getDepositTaxBps(assetAddress);
	poolDepositTaxes.update((pdt) => {
		pdt[asset] = Math.round(taxBps * 100 / BPS_DIVIDER);
		return pdt;
	});
	return true;
}

export async function getPoolWithdrawalTaxBps(asset) {
	const contract = await getContract('Pool');
	const assetAddress = getAssetAddress(asset);
	const taxBps = await contract.getWithdrawalTaxBps(assetAddress);
	poolWithdrawalTaxes.update((pwt) => {
		pwt[asset] = Math.round(taxBps * 100 / BPS_DIVIDER);
		return pwt;
	});
	return true;
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
