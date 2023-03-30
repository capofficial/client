<script>

	import { onMount, onDestroy } from 'svelte'

	import LabelValue from '@components/layout/LabelValue.svelte'
	import Fee from './Fee.svelte'

	import { isLong, margin, isReduceOnly, liquidationPrice, sizeInUsd, tpPrice, slPrice, oi, maxOI } from '@lib/stores'
	import { formatForDisplay, labeledNumber } from '@lib/formatters'

	import { getOI, getMaxOI } from '@api/positions'

	export let market;
	export let asset;
	export let size;
	export let isClose = false;

	let isLoading = true, t;
	async function fetchData(market, asset, newChange) {
		clearTimeout(t);
		if (newChange) isLoading = true;
		await getOI(market, asset);
		await getMaxOI(market, asset);
		isLoading = false;
		t = setTimeout(fetchData, 60 * 1000);
	}
	$: fetchData(market, asset, true);

	onDestroy(() => {
		clearTimeout(t);
	});

	let showMore = false;

	let availableLiquidity = 0;

	function calculateAvailableLiquidity() {
		// console.log($maxOI, $oi);
		if (!$maxOI || $maxOI * 1 == 0 || isNaN($maxOI * 1)) {
			availableLiquidity = '∞';
		} else {
			availableLiquidity = $maxOI * 1 - $oi * 1;
			if (availableLiquidity * 1 < 0) availableLiquidity = 0;
			if (isNaN(availableLiquidity)) availableLiquidity = $maxOI;
		}
	}

	$: calculateAvailableLiquidity($oi, $maxOI);

</script>

<style>
	.order-info {
	}
	.row {
		display: flex;
		align-items: center;
		height: 30px;
		justify-content: space-between;
	}
	.sep {
		margin: 10px 0;
		border-top: 1px solid var(--layer100);
		height:1px;
	}
	.gray {
		color: var(--text400);
	}
</style>

<div class='order-info'>

	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label={'Margin'}
				value={`${$margin ? `${formatForDisplay($margin)} ${asset}` : '-'}`}
			/>
		</div>

	{/if}

	<div class='row'>
		<Fee
			market={market}
			asset={asset}
			size={size}
			isSecondaryColor={!isClose && !$isLong}
			hasTP={!isClose && $tpPrice * 1 > 0}
			hasSL={!isClose && $slPrice * 1 > 0}
		/>
	</div>

	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label='Liq. Price' 
				value={`${size > 0 && !$isReduceOnly ? formatForDisplay($liquidationPrice) : '-'}`}
			/>
		</div>

		<div class='row'>
			<LabelValue 
				label='Size (USD)' 
				value={`${size > 0 ? `$${formatForDisplay($sizeInUsd)}` : '-'}`}
			/>
			
		</div>

		<div class='sep'>&nbsp;</div>

		<div class='row gray'>
			<LabelValue 
				label='Available Liquidity' 
				value={`${isLoading ? '-' : `${availableLiquidity == '∞' ? '∞' : `${labeledNumber(availableLiquidity)} ${asset}`}`}`}
			/>
		</div>

		<!-- <div class='row'>
			<LabelValue 
				label='Max Liq.' 
				value={`${isLoading ? '-' : `${$maxOI ? labeledNumber($maxOI) : '∞'} ${asset}`}`}
			/>
		</div> -->
	{/if}

</div>