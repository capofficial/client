<script>

	import LabelValue from '@components/layout/LabelValue.svelte'

	import { BPS_DIVIDER, BASE_FEES_BPS } from '@lib/config'
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

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);

	function getFeeRate() {
		return $marketInfos[market]?.fee || 0;
	}

	function getBaseFeeRate() {
		return BASE_FEES_BPS[market] || getFeeRate();
	}

	function getReferralDiscountRate() {
		const discount = getBaseFeeRate() - getFeeRate();
		return discount > 0 ? discount : 0;
	}

	function getFeeDetails() {
		const baseFeeRate = getBaseFeeRate();
		const feeRate = getFeeRate();
		const referralDiscountRate = getReferralDiscountRate();

		if (!baseFeeRate) return 'Fee details loading...';

		return [
			`Base fee: ${formatForDisplay(baseFeeRate / 100)}%`,
			`Referral discount: ${formatForDisplay(referralDiscountRate / 100)}%`,
			`Current fee: ${formatForDisplay(feeRate / 100)}%`
		].join('<br>');
	}

	let feeDetails;
	$: feeDetails = getFeeDetails(market, $marketInfos);

</script>

<LabelValue 
	label={`Fee (${formatForDisplay(getFeeRate()/100)}%)`}
	value={`${feeAmount ? `${formatForDisplay(feeAmount)} ${asset}` : '-'}`}
	valueNote={feeDetails}
	valueNoteTrigger='click mouseenter focus'
	isClickable={true}
	isSecondaryColor={isSecondaryColor}
/>
