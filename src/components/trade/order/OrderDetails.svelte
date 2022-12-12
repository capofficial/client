<script>

	import { onDestroy } from 'svelte'

	import LabelValue from '@components/layout/LabelValue.svelte'
	import Fee from './Fee.svelte'
	
	import { CURRENCY_DECIMALS, BPS_DIVIDER } from '@lib/config'

	import { address, isLong, margin, isReduceOnly, liquidationPrice, sizeInUsd, balances, buyingPower, fundingRate, tpPrice, slPrice } from '@lib/stores'
	import { CHECKMARK_CIRCLE_ICON, WARNING_ICON } from '@lib/icons'
	import { formatUnits, formatForDisplay } from '@lib/formatters'
	import { showModal } from '@lib/ui'

	import { getOI, getRiskParams } from '@api/markets'

	export let market;
	export let asset;
	export let size;
	export let isClose = false;
	export let clickableFee = true;

	// $: console.log('size', size);

	let t2, decimals, oi = 0, maxOI = 0, poolAvailable = 0, marketProfitTracker = 0, marketProfitLimit = 0, poolProfitTracker = 0, poolProfitLimit = 0;
	export let displaySizeOrMargin;

	let profitLimit = 0, availableLiquidity = 0;
	async function fetchRiskData() {
		clearTimeout(t2);
		decimals = CURRENCY_DECIMALS[asset];
		oi = await getOI(market, asset, true);
		
		let riskParams = await getRiskParams(asset, market, true);

		oi = formatUnits(oi, decimals) * 1;

		poolAvailable = formatUnits(riskParams[0], decimals) * 1;
		maxOI = formatUnits(riskParams[1], decimals) * 1;

		if (maxOI > 0) {
			availableLiquidity = maxOI - oi;
		}

		let toMin = [];
		toMin.push(poolAvailable);

		marketProfitTracker = formatUnits(riskParams[2], decimals) * 1;
		marketProfitLimit = riskParams[3] * poolAvailable / BPS_DIVIDER;
		if (marketProfitTracker > 0 && marketProfitLimit >= marketProfitTracker) toMin.push(marketProfitLimit - marketProfitTracker);

		poolProfitTracker = formatUnits(riskParams[4], decimals) * 1;
		poolProfitLimit = riskParams[5] * poolAvailable / BPS_DIVIDER;
		if (poolProfitTracker > 0 && poolProfitLimit >= poolProfitTracker) toMin.push(poolProfitLimit - poolProfitTracker);


		// console.log('s', poolAvailable, poolProfitLimit, poolProfitTracker, marketProfitLimit, marketProfitTracker);

		profitLimit = Math.min(toMin);

		t2 = setTimeout(fetchRiskData, 2*60*1000);
	}
	$: fetchRiskData(asset, market);


	onDestroy(() => {
		clearTimeout(t2);
	});

	let showMore = false;

</script>

<style>
	.order-info {
	}
	.row {
		display: flex;
		align-items: center;
		height: 26px;
		justify-content: space-between;
	}
	.small {
		font-size: 90%;
	}

	.label {
		cursor: default;
		text-transform: capitalize;
		color: var(--text400);
	}

	.value :global(svg) {
		fill: var(--text1);
		width: 12px;
		margin-right: 4px;
	}
	.show-more {
		color: var(--primary);
		font-size: 90%;
		padding-top: 6px;
		cursor: pointer;
	}
</style>

{#if size > 0}
<div class='order-info'>

	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label={displaySizeOrMargin == 'Margin' ? 'Size' : 'Margin'}
				value={`${size > 0 ? `${formatForDisplay(displaySizeOrMargin == 'Margin' ? size : $margin)} ${asset}` : '-'}`}
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
			clickable={clickableFee}
		/>
	</div>

	{#if !isClose}

		<div class='row'>
			<LabelValue 
				label='Liq. Price' 
				value={`${size > 0 && !$isReduceOnly ? formatForDisplay($liquidationPrice) : '-'}`}
			/>
		</div>

	{/if}	
	
	{#if showMore}

		{#if !isClose}

			<div class='row'>
				<LabelValue 
					label='Size in USD' 
					value={`$${formatForDisplay($sizeInUsd)}`}
				/>
				
			</div>
			
			{#if availableLiquidity > 0}
			<div class='row'>
				<div class='label'>Available Liquidity <!-- (max oi - OI) --></div>
				<div class='value'>
					{#if size > 0}
						{#if size * 1 < availableLiquidity}
						{@html CHECKMARK_CIRCLE_ICON}
						{:else}
						{@html WARNING_ICON}
						{/if}
					{/if} {formatForDisplay(availableLiquidity)} {asset}
				</div>
			</div>
			{/if}

		{/if}

		<div class='row small'>
			<div class='label'>Profit Limit <!-- (min of pool available, PPL, and MPL) --></div>
			<div class='value'>{formatForDisplay(profitLimit)} {asset}</div>
		</div>

	{/if}

	<div class='show-more' on:click={() => {showMore = !showMore}}>Show {#if showMore}Less{:else}More{/if}</div>

</div>
{/if}