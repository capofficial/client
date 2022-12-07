import { get } from 'svelte/store'
import { ethers } from 'ethers'
import { CURRENCY_DECIMALS } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { address, provider, balances, selectedAsset, allowances } from '@lib/stores'
import { getAssets } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

async function getBalanceOf(asset) {
	const _address = get(address);
	if (!_address) return 0;
	let balance, decimals;
	if (asset == 'ETH') {
		balance = await get(provider).getBalance(_address);
	} else {
		const contract = await getContract(asset);
		decimals = CURRENCY_DECIMALS[asset];
		balance = await contract.balanceOf(_address);
	}
	return formatUnits(balance, decimals || 18);
}

export async function getUserAssetBalances(assets) {
	// console.log('getUserAssetBalances', assets);
	if (!assets) assets = getAssets();
	for (const asset of assets) {
		let balance = await getBalanceOf(asset);
		balances.update((bls) => {
			bls[asset] = balance;
			return bls;
		});
	}
}

export async function getAllowance(assetLabel, spenderName) {
	if (!assetLabel) return;
	if (assetLabel == 'ETH') {
		allowances.update((x) => {
			if (!x[assetLabel]) x[assetLabel] = {};
			x[assetLabel][spenderName] = parseUnits(10**10, 18);
			return x;
		});
		return;
	}
	const _address = get(address);
	if (!_address) return;
	const contract = await getContract(assetLabel);
	const spenderContract = await getContract(spenderName);
	const allowance = formatUnits(await contract.allowance(_address, spenderContract.address), CURRENCY_DECIMALS[assetLabel]);
	allowances.update((x) => {
		if (!x[assetLabel]) x[assetLabel] = {};
		x[assetLabel][spenderName] = allowance;
		return x;
	});
}

export async function approveAsset(assetLabel, spenderName) {
	const contract = await getContract(assetLabel, true);
	const spenderContract = await getContract(spenderName);
	const spenderAddress = spenderContract.address;
	try {
		let tx = await contract.approve(spenderAddress, ethers.constants.MaxUint256);
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Approved asset.', 1);
			getAllowance(assetLabel, spenderName);
			return true;
		}
	} catch(e) {
		showError(e);
	}
}