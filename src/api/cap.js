import { get } from 'svelte/store'
import { CURRENCY_DECIMALS } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits } from '@lib/formatters'
import { address, totalSupplyCAP, CAPStake, claimableRewardsCAP } from '@lib/stores'
import { getAssetAddresses, getLabelForAsset } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

export async function getTotalSupplyCAP() { // staked
	const contract = await getContract('StakingStore');
	totalSupplyCAP.set(formatUnits(await contract.getTotalSupply()));
}

export async function getUserCAPStake() {
	if (!get(address)) return;
	const contract = await getContract('StakingStore');
	const balance = await contract.getBalance(get(address));
	CAPStake.set(formatUnits(balance));
}

export async function getCAPWalletBalance() {
	if (!get(address)) return 0;
	const contract = await getContract("CAP", true);
	const balance = await contract.balanceOf(get(address));
	return formatUnits(balance);
}

export async function getClaimableRewardsCAP() {
	if (!get(address)) return;
	const contract = await getContract('Staking');
	const assetAddresses = getAssetAddresses();
	const amounts = await contract.getClaimableRewards(assetAddresses, get(address));
	let rewards = {};
	let i = 0;
	for (const amount of amounts) {
		const asset = getLabelForAsset(assetAddresses[i]);
		rewards[asset] = formatUnits(amount, CURRENCY_DECIMALS[asset]);
		i++;
	}
	claimableRewardsCAP.set(rewards);
}

export async function depositCAP(_amount) {
	const contract = await getContract('Staking', true);
	const amount = parseUnits(_amount);
	try {
		let tx = await contract.stake(amount);
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('CAP Staked.', 1);
			getTotalSupplyCAP();
			getUserCAPStake();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}

export async function withdrawCAP(_amount) {
	const contract = await getContract('Staking', true);
	const amount = parseUnits(_amount);
	try {
		let tx = await contract.unstake(amount);
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('CAP Unstaked.', 1);
			getTotalSupplyCAP();
			getUserCAPStake();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}

export async function collectAllCAPRewards() {
	const contract = await getContract('Staking', true);
	const assetAddresses = getAssetAddresses();
	try {
		let tx = await contract.collectMultiple(assetAddresses);
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Collected CAP rewards.', 1);
			getClaimableRewardsCAP();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}