<script>

	import LabelValue from '@components/layout/LabelValue.svelte'

	import { BASE_FEES_BPS, BPS_DIVIDER } from '@lib/config'
	import { marketInfos } from '@lib/stores'
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

	function getReferralDiscount(marketInfo) {
		if (!marketInfo) return 0;

		return (
			marketInfo.referralDiscountBps ??
			marketInfo.referralDiscountBPS ??
			marketInfo.referralFeeDiscountBps ??
			marketInfo.referralFeeDiscountBPS ??
			marketInfo.referralDiscount ??
			marketInfo.referralFeeDiscount ??
			0
		) * 1;
	}

	function getFeeDetails() {
		const marketInfo = $marketInfos[market];
		if (!market || !marketInfo) return false;

		const baseFeeBps = BASE_FEES_BPS[market] || marketInfo.baseFee || marketInfo.baseFeeBps || marketInfo.fee || 0;
		const feeBps = marketInfo.fee || 0;
		const totalDiscountBps = Math.max(baseFeeBps - feeBps, 0);
		const referralDiscountBps = Math.min(getReferralDiscount(marketInfo), totalDiscountBps);
		const otherDiscountBps = Math.max(totalDiscountBps - referralDiscountBps, 0);

		let rows = [
			`Base fee: ${formatForDisplay(baseFeeBps / 100)}%`,
			`Current fee: ${formatForDisplay(feeBps / 100)}%`
		];

		if (totalDiscountBps > 0) {
			rows.push(`Total discount: ${formatForDisplay(totalDiscountBps / 100)}%`);
		}
		if (otherDiscountBps > 0) {
			rows.push(`Staking / volume discount: ${formatForDisplay(otherDiscountBps / 100)}%`);
		}
		if (referralDiscountBps > 0) {
			rows.push(`Referral discount: ${formatForDisplay(referralDiscountBps / 100)}%`);
		}

		return rows.join('<br>');
	}

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);

	let feeDetails = false;
	$: feeDetails = getFeeDetails(market, $marketInfos);

</script>

<LabelValue 
	label={`Fee (${formatForDisplay(($marketInfos[market]?.fee || 0)/100)}%)`} 
	value={`${feeAmount ? `${formatForDisplay(feeAmount)} ${asset}` : '-'}`}
	note={feeDetails}
	isSecondaryColor={isSecondaryColor}
/>