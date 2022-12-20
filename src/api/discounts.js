import { get } from 'svelte/store'
import { BPS_DIVIDER } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits, parseUnits, formatFeeStat } from '@lib/formatters'
import { address, trailing30dayVolume, currentFeeRebate, feeRebateFromVolume, feeRebateFromStaking, rebateParams, totalFeesSaved, feeRebateFromReferral } from '@lib/stores'
import { getChainData, getLabelForAsset } from '@lib/utils'
import { showToast, showError } from '@lib/ui'

export async function getUserVolume() {
	if (!get(address)) return 0;
	const contract = await getContract('RebateStore');
	trailing30dayVolume.set(await contract.getUserVolume(get(address)));
}

export async function getUserRebate() {
	if (!get(address)) return 0;
	const contract = await getContract('RebateStore');
	currentFeeRebate.set(await contract.getUserRebate(get(address)) / BPS_DIVIDER);
}

export async function getUserVolumeRebate() {
	if (!get(address)) return 0;
	const contract = await getContract('RebateStore');
	feeRebateFromVolume.set(await contract.getVolumeRebate(get(address)) / BPS_DIVIDER);
}
export async function getUserStakingRebate() {
	if (!get(address)) return 0;
	const contract = await getContract('RebateStore');
	feeRebateFromStaking.set(await contract.getStakingRebate(get(address)) / BPS_DIVIDER);
}

export async function getReferralRebate() {
	const contract = await getContract('ReferralStore');
	const _address = get(address);
	if (!_address) return 0;
	const rebate = await contract.getRebateForUser(_address);
	feeRebateFromReferral.set((rebate / BPS_DIVIDER));
}

export async function getRebateParams() {
	const contract = await getContract('RebateStore');
	rebateParams.set(await contract.getParams());
}

export async function getUserFeesSaved() {

	const dataEndpoint = getChainData('dataEndpoint');
	
	let _address = get(address);
	if (!_address) return;

	_address = _address.toLowerCase();

	try {
		const response = await fetch(`${dataEndpoint}/fees/${_address}`);
		const stats = await response.json() || {};

		// console.log('stats', stats);
		
		for (let asset in stats) {
			const assetLabel = getLabelForAsset(asset);
			totalFeesSaved.update((tfs) => {
				tfs[assetLabel] = stats[asset];
				return tfs;
			});
		}

	} catch(e) {
		console.error('/fees GET error', e);
	}

	return true;

}