import { get } from 'svelte/store'
import { getContract } from '@lib/contracts'
import { parseUnits, createOrderTuple } from '@lib/formatters'
import { address, referralCode } from '@lib/stores'
import { showToast, showError } from '@lib/ui'

export async function getReferralCode() {
	const contract = await getContract('ReferralStore');
	const _address = get(address);
	if (!_address) return;
	const code = await contract.getReferralCode(_address);
	referralCode.set(code);
}

export async function setReferralCode(code) {
	const contract = await getContract('ReferralStore', true);
	const _address = get(address);
	if (!address) return;
	try {
		let tx = await contract.setReferralCode(code);
		let receipt = await tx.wait();
		if (receipt && receipt.status == 1) {
			showToast('Referral code updated.', 1);
			getReferralCode();
			return true;
		}
		return false;
	} catch(e) {
		showError(e);
	}
}