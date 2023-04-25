import { get } from 'svelte/store'
import { ARB_TOKEN } from '@lib/config'
import { getContract } from '@lib/contracts'
import { formatUnits } from '@lib/formatters'
import { address, reward } from '@lib/stores'
import { showToast, showError } from '@lib/ui'

export async function getReward() {
	if (!get(address)) return false;
	const contract = await getContract('RewardStore');
	reward.set(formatUnits(await contract.getReward(get(address), ARB_TOKEN)));
}

export async function claimReward() {
	if (!get(address)) return false;
	const contract = await getContract('Rewards', true);
	try {
		let tx = await contract.claimReward();
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Reward claimed.', 1);
			getReward();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}