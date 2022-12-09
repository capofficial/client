import { get } from 'svelte/store'
import { CURRENCY_DECIMALS, BPS_DIVIDER } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { address, poolBalances, poolStakes, poolStatsDaily, poolStatsWeekly, poolWithdrawalFees } from '@lib/stores'
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

export async function getPoolWithdrawalFee(asset) {
	const contract = await getContract('PoolStore');
	const assetAddress = getAssetAddress(asset);
	const fee = await contract.getWithdrawalFee(assetAddress);
	poolWithdrawalFees.update((pwf) => {
		pwf[asset] = Math.round(fee * 100 / BPS_DIVIDER) / 100;
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

export async function getPoolStats() {

	const dataEndpoint = getChainData('dataEndpoint');
	
	const assets = getChainData('assets');

	try {
		const response = await fetch(`${dataEndpoint}/pool-stats/all`);
		const data = await response.json(); // {asset => {daily, weekly}}

		for (let asset in data) {
			const assetLabel = getLabelForAsset(asset);
			const assetData = data[asset];
			poolStatsDaily.update((psd) => {
				psd[assetLabel] = assetData.daily;
				return psd;
			});
			poolStatsWeekly.update((psw) => {
				psw[assetLabel] = assetData.weekly;
				return psw;
			});
		}

	} catch(e) {
		console.error('/pool-stats GET error', e);
	}

	return true;

}