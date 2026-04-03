<script>

	import LabelValue from '@components/layout/LabelValue.svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { marketInfos, CAPStake, stats } from '@lib/stores'
	import { get } from 'svelte/store'

	import { formatForDisplay } from '@lib/formatters'

	export let size;
	export let market;
	export let asset;
	export let hasTP = false;
	export let hasSL = false;
	export let isSecondaryColor = false;

	let totalSize;
	$: totalSize = size;
	function checkTPSL() {
		// console.log(hasTP, hasSL);
		if (hasTP) {
			totalSize = size * 2;
		}
		if (hasSL) {
			totalSize = size * 2;
		}
		if (hasSL && hasTP) {
			totalSize = size * 3;
		}
		if (!hasSL && !hasTP) {
			totalSize = size;
		}
	}

	$: checkTPSL(hasTP, hasSL);

	function getFeeAmount() {
		// console.log('getFeeAmount', totalSize, market, $marketInfos[market]);
		if (!totalSize || !market || !$marketInfos[market]) return 0;
		return totalSize * $marketInfos[market].fee * 1 / BPS_DIVIDER;
	}

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);

	// Calculate fee breakdown
	$: baseFeeBps = $marketInfos[market]?.baseFee || $marketInfos[market]?.fee || 0;
	$: currentFeeBps = $marketInfos[market]?.fee || 0;
	
	// Calculate discounts
	$: capStaked = get(CAPStake) || 0;
	$: capDiscount = capStaked > 0 ? Math.min(capStaked * 0.01, 20) : 0; // 1% per CAP staked, max 20%
	
	$: userStats = get(stats) || {};
	$: volume30d = userStats[get(stats)?.address]?.volume || 0;
	$: volumeDiscount = volume30d > 1000000 ? 10 : volume30d > 100000 ? 5 : 0; // Volume tiers
	
	$: referralDiscount = userStats[get(stats)?.address]?.referralDiscount || 0; // Referral discount
	
	$: totalDiscount = capDiscount + volumeDiscount + referralDiscount;
	$: totalDiscount = Math.min(totalDiscount, 50); // Cap at 50%
	
	$: feeNote = baseFeeBps > currentFeeBps ? `
		<div style="text-align: left; line-height: 1.5;">
			<strong>Fee Breakdown</strong><br/>
			Base Fee: ${(baseFeeBps/100).toFixed(2)}%<br/>
			${capDiscount > 0 ? `CAP Staking: -${capDiscount.toFixed(1)}%<br/>` : ''}
			${volumeDiscount > 0 ? `Volume (30d): -${volumeDiscount.toFixed(1)}%<br/>` : ''}
			${referralDiscount > 0 ? `Referral: -${referralDiscount.toFixed(1)}%<br/>` : ''}
			<strong>Your Fee: ${(currentFeeBps/100).toFixed(2)}%</strong>
		</div>
	` : false;

</script>

<LabelValue 
	label={`Fee (${formatForDisplay(($marketInfos[market]?.fee || 0)/100)}%)`} 
	value={`${feeAmount ? `${formatForDisplay(feeAmount)} ${asset}` : '-'}`}
	isSecondaryColor={isSecondaryColor}
	note={feeNote}
/>