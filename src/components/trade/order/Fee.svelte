<script>

	import LabelValue from '@components/layout/LabelValue.svelte'

	import { BPS_DIVIDER } from '@lib/config'
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


</script>

<LabelValue 
	label={`Fee (${formatForDisplay(($marketInfos[market]?.fee || 0)/100)}%)`} 
	value={`${formatForDisplay(feeAmount)} ${asset}`}
	isSecondaryColor={isSecondaryColor}
/>