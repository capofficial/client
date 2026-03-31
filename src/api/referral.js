import { get } from 'svelte/store'
import { getChainData } from '@lib/utils'

import { address, referralDiscount } from '@lib/stores'

export async function getReferralDiscount() {
	const dataEndpoint = getChainData('dataEndpoint');
	const userAddress = get(address);

	if (!userAddress) {
		referralDiscount.set(0);
		return false;
	}

	try {
		const response = await fetch(`${dataEndpoint}/referral?chain=arbitrum&user=${userAddress}`);
		const data = await response.json();
		// Referral discount is returned in basis points (bps)
		referralDiscount.set(data?.discount || 0);
	} catch(e) {
		// Referral data might not exist for all users
		referralDiscount.set(0);
	}

	return true;
}
