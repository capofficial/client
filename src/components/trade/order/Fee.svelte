<script>

	import { onDestroy } from 'svelte'

	import LabelValue from '@components/layout/LabelValue.svelte'

	import { BPS_DIVIDER } from '@lib/config'
	import { address, marketInfos, currentFeeRebate } from '@lib/stores'
	import { showModal } from '@lib/ui'

	import { formatForDisplay } from '@lib/formatters'

	import { getUserRebate } from '@api/discounts'

	export let size;
	export let market;
	export let asset;
	export let hasTP = false;
	export let hasSL = false;
	export let isSecondaryColor = false;
	export let clickable = true;

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


	let t1;
	async function fetchData() {
		clearTimeout(t1);
		getUserRebate();
		t1 = setTimeout(fetchData, 10 * 60 * 1000);
	}
	$: fetchData($address);

	onDestroy(() => {
		clearTimeout(t1);
	});

	function getFeeAmount() {
		// console.log('getFeeAmount', totalSize, market, $marketInfos[market]);
		if (!totalSize || !market || !$marketInfos[market]) return 0;
		return totalSize * $marketInfos[market].fee * 1 / BPS_DIVIDER;
	}

	let feeAmount = 0;
	$: feeAmount = getFeeAmount(totalSize, market, $marketInfos);

	function getFeeWithRebate() {
		if (!$currentFeeRebate) return $marketInfos[market]?.fee || 0;
		return $marketInfos[market]?.fee * (1 - 1 * $currentFeeRebate) || 0;
	}

	let feeWithRebate = 0;
	$: feeWithRebate = getFeeWithRebate($currentFeeRebate, $marketInfos);

	function getFeeAmountWithRebate() {
		if (!$currentFeeRebate) return getFeeAmount();
		return getFeeAmount() * (1 - 1 * $currentFeeRebate);
	}

	let feeAmountWithRebate = 0;
	$: feeAmountWithRebate = getFeeAmountWithRebate($currentFeeRebate, feeAmount);


</script>

<LabelValue 
	label={`Fee (${formatForDisplay(feeWithRebate/100)}%)`} 
	value={`${formatForDisplay(feeAmountWithRebate)} ${feeAmountWithRebate != feeAmount ? `<span style='text-decoration: line-through;opacity:0.45;'>${formatForDisplay(feeAmount)}</span>` : ''} ${asset}`}
	on:click={clickable ? () => {showModal('FeeDiscounts')} : null}
	isClickable={clickable}
	note='Fee charged on this order, including discounts. Click to learn more.'
	isSecondaryColor={isSecondaryColor}
/>